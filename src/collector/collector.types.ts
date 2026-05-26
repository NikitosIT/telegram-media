import type {
  TelegramCollectedMediaItems,
  SupportedTelegramMediaType,
  TelegramBotMessage,
  TelegramCollectedPost,
  TelegramMediaCollectorErrorContext,
  TelegramMediaCollectorErrorMode,
  TelegramMediaFieldsConfig,
  TelegramMediaGroupMessage,
  TelegramPhotoSizePreference,
} from "../types/public-types.js";
import type {
  GroupKey,
  MediaGroupStorage,
} from "../types/storage-contract.types.js";

export type TimerHandle = ReturnType<typeof setTimeout>;

export type TelegramMediaCollectorOptions<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> = {
  onCollected: (
    post: TelegramCollectedPost<TMessage, TMediaFields>,
  ) => Promise<void> | void;
  storage?: MediaGroupStorage<TMessage>;
  timeoutMs?: number;
  supportedMediaTypes?: SupportedTelegramMediaType[];
  photoSize?: TelegramPhotoSizePreference;
  mediaFields?: TMediaFields;
  errorMode?: TelegramMediaCollectorErrorMode;
  onError?: (
    error: unknown,
    context: TelegramMediaCollectorErrorContext,
  ) => Promise<void> | void;
};

export type TelegramMediaCollectorCoreOptions<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> = Omit<TelegramMediaCollectorOptions<TMessage, TMediaFields>, "storage"> & {
  storage: MediaGroupStorage<TMessage>;
};

export type TelegramCollectedMediaOutputItem<
  TMediaFields extends TelegramMediaFieldsConfig | undefined,
> = TelegramCollectedMediaItems<TMediaFields>[number];

export type TelegramMediaGroupCollectorType<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
  _TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> = {
  collect(message: TMessage): Promise<void>;
  flush(
    telegramChatId: GroupKey["chatId"],
    mediaGroupId: string,
  ): Promise<void>;
  discard(
    telegramChatId: GroupKey["chatId"],
    mediaGroupId: string,
  ): Promise<void>;
};
