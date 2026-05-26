import { serializeGroupKey } from "../group-key/group-key.js";
import type {
  TelegramCollectedPost,
  TelegramMediaCollectorErrorContext,
  TelegramMediaCollectorErrorMode,
  TelegramMediaFieldsConfig,
  TelegramMediaGroupMessage,
  TelegramPhotoSizePreference,
} from "../types/public-types.js";
import type {
  GroupKey,
  StoredTelegramMediaGroup,
} from "../types/storage-contract.types.js";
import { withDefined } from "../helpers/defined-props.js";
import { assertValidTimeoutMs } from "../helpers/timeout.js";
import { createCollectorErrorHandlers } from "./collector.errors.js";
import { buildCollectedPost } from "./collector.media.js";
import type {
  TelegramMediaCollectorCoreOptions,
  TimerHandle,
} from "./collector.types.js";

const DEFAULT_TIMEOUT_MS = 1500;
const STORAGE_TTL_GRACE_MS = 5000;
const DEFAULT_PHOTO_SIZE_PREFERENCE: TelegramPhotoSizePreference = "big";
const DEFAULT_ERROR_MODE: TelegramMediaCollectorErrorMode = "report-and-throw";

export const createTelegramMediaGroupCollector = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
>({
  storage,
  onCollected,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  supportedMediaTypes,
  photoSize = DEFAULT_PHOTO_SIZE_PREFERENCE,
  mediaFields,
  errorMode = DEFAULT_ERROR_MODE,
  onError,
}: TelegramMediaCollectorCoreOptions<TMessage, TMediaFields>) => {
  assertValidTimeoutMs(timeoutMs, "collector options");

  const timers = new Map<string, TimerHandle>();
  const { handlePublicError, handleBackgroundError } =
    createCollectorErrorHandlers({
      errorMode,
      ...withDefined(onError, (definedOnError) => ({
        onError: definedOnError,
      })),
    });

  const clearScheduledFlush = (groupKey: GroupKey): void => {
    const serializedGroupKey = serializeGroupKey(groupKey);
    const timer = timers.get(serializedGroupKey);

    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);
    timers.delete(serializedGroupKey);
  };

  const toGroupKey = (message: TMessage): GroupKey => ({
    chatId: message.chat.id,
    mediaGroupId: message.media_group_id!,
  });

  const buildPost = (
    messages: TMessage[],
  ): TelegramCollectedPost<TMessage, TMediaFields> =>
    buildCollectedPost<TMessage, TMediaFields>(messages, {
      ...withDefined(supportedMediaTypes, (definedSupportedMediaTypes) => ({
        supportedMediaTypes: definedSupportedMediaTypes,
      })),
      photoSize,
      ...withDefined(mediaFields, (definedMediaFields) => ({
        mediaFields: definedMediaFields,
      })),
    });

  const flushInternal = async (
    groupKey: GroupKey,
    operation: TelegramMediaCollectorErrorContext["operation"],
  ): Promise<void> => {
    const group = await storage.get(groupKey);

    if (group === null) {
      clearScheduledFlush(groupKey);
      return;
    }

    if (operation === "auto-flush") {
      const waitMs = group.updatedAt + group.timeoutMs - Date.now();

      if (waitMs > 0) {
        scheduleAutoFlush({
          ...group,
          timeoutMs: waitMs,
        });
        return;
      }
    }
    await onCollected(buildPost(group.messages));
    await storage.delete(groupKey);
  };

  const scheduleAutoFlush = (
    group: StoredTelegramMediaGroup<TMessage>,
  ): void => {
    clearScheduledFlush(group.groupKey);

    const serializedGroupKey = serializeGroupKey(group.groupKey);
    const timer = setTimeout(async () => {
      try {
        await flushInternal(group.groupKey, "auto-flush");
      } catch (error) {
        await handleBackgroundError(error, {
          operation: "auto-flush",
          groupKey: group.groupKey,
        });
      }
    }, group.timeoutMs);

    if (typeof timer.unref === "function") {
      timer.unref();
    }

    timers.set(serializedGroupKey, timer);
  };

  return {
    async collect(message: TMessage): Promise<void> {
      try {
        if (message.media_group_id === undefined) {
          await onCollected(buildPost([message]));
          return;
        }

        const groupKey = toGroupKey(message);
        const nextGroup = await storage.appendMessage({
          groupKey,
          message,
          now: Date.now(),
          defaultTimeoutMs: timeoutMs,
          ttlGraceMs: STORAGE_TTL_GRACE_MS,
        });
        scheduleAutoFlush(nextGroup);
      } catch (error) {
        await handlePublicError(error, {
          operation: "collect",
          ...withDefined(message.media_group_id, () => ({
            groupKey: toGroupKey(message),
          })),
          messageId: message.message_id,
        });
      }
    },

    async flush(
      telegramChatId: GroupKey["chatId"],
      mediaGroupId: string,
    ): Promise<void> {
      try {
        await flushInternal({ chatId: telegramChatId, mediaGroupId }, "flush");
      } catch (error) {
        await handlePublicError(error, {
          operation: "flush",
          groupKey: { chatId: telegramChatId, mediaGroupId },
        });
      }
    },

    async discard(
      telegramChatId: GroupKey["chatId"],
      mediaGroupId: string,
    ): Promise<void> {
      const groupKey = { chatId: telegramChatId, mediaGroupId };

      try {
        await storage.delete(groupKey);
        clearScheduledFlush(groupKey);
      } catch (error) {
        await handlePublicError(error, {
          operation: "discard",
          groupKey,
        });
      }
    },
  };
};
