import { createMemoryMediaGroupStorage } from "../storage/memory-storage.js";
import type {
  TelegramMediaFieldsConfig,
  TelegramBotMessage,
  TelegramMediaGroupMessage,
} from "../types/public-types.js";
import { withDefined } from "../helpers/defined-props.js";
import { createTelegramMediaGroupCollector } from "./collector.core.js";
import {
  getUpdateMessage,
  UNSUPPORTED_UPDATE_ERROR_MESSAGE,
  type TelegramMediaGroupUpdate,
} from "./collector.update.js";
import type {
  TelegramMediaCollectorCoreOptions,
  TelegramMediaCollectorOptions,
  TelegramMediaGroupCollectorType,
} from "./collector.types.js";

/**
 * Internal high-level collector implementation. Prefer using the
 * `createTelegramMediaGroup` factory from the package root in application code.
 */
export class TelegramMediaGroupCollector<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> {
  private readonly collector: TelegramMediaGroupCollectorType<
    TMessage,
    TMediaFields
  >;

  public constructor(
    options: TelegramMediaCollectorOptions<TMessage, TMediaFields>,
  ) {
    const collectorOptions: TelegramMediaCollectorCoreOptions<
      TMessage,
      TMediaFields
    > = {
      onCollected: options.onCollected,
      storage: options.storage ?? createMemoryMediaGroupStorage<TMessage>(),
      ...withDefined(options.timeoutMs, (timeoutMs) => ({ timeoutMs })),
      ...withDefined(options.supportedMediaTypes, (supportedMediaTypes) => ({
        supportedMediaTypes,
      })),
      ...withDefined(options.photoSize, (photoSize) => ({ photoSize })),
      ...withDefined(options.mediaFields, (mediaFields) => ({ mediaFields })),
      ...withDefined(options.errorMode, (errorMode) => ({ errorMode })),
      ...withDefined(options.onError, (onError) => ({ onError })),
    };

    this.collector = createTelegramMediaGroupCollector<TMessage, TMediaFields>(
      collectorOptions,
    );
  }

  /**
   * Collects a Telegram update and resolves once it has been accepted for processing.
   * Single messages complete immediately; media groups complete later through onCollected.
   */
  public async collect(
    update: TelegramMediaGroupUpdate<TMessage>,
  ): Promise<void> {
    const message = getUpdateMessage(update);

    if (message === null) {
      throw new Error(UNSUPPORTED_UPDATE_ERROR_MESSAGE);
    }

    await this.collector.collect(message);
  }

  /**
   * Forces a pending media group to finalize immediately using the original
   * Telegram message chat id (`message.chat.id`) and the media group id.
   */
  public async flush(
    telegramChatId: number | string,
    mediaGroupId: string,
  ): Promise<void> {
    await this.collector.flush(telegramChatId, mediaGroupId);
  }

  /**
   * Removes a pending media group from storage using the original Telegram
   * message chat id (`message.chat.id`) and the media group id.
   */
  public async discard(
    telegramChatId: number | string,
    mediaGroupId: string,
  ): Promise<void> {
    await this.collector.discard(telegramChatId, mediaGroupId);
  }
}

/**
 * Creates a Telegram media group processor that accepts Telegram updates and
 * emits normalized collected posts through the configured callbacks.
 */
export const createTelegramMediaGroup = <
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
>(
  options: TelegramMediaCollectorOptions<TMessage, TMediaFields>,
): TelegramMediaGroupCollector<TMessage, TMediaFields> =>
  new TelegramMediaGroupCollector<TMessage, TMediaFields>(options);
