import type {
  TelegramCollectedMediaItems,
  SupportedTelegramMediaType,
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
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
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
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> = Omit<TelegramMediaCollectorOptions<TMessage, TMediaFields>, "storage"> & {
  storage: MediaGroupStorage<TMessage>;
};

export type TelegramMediaCollectCallOptions = {
  timeoutMs?: number;
};

export type TelegramCollectedMediaOutputItem<
  TMediaFields extends TelegramMediaFieldsConfig | undefined,
> = TelegramCollectedMediaItems<TMediaFields>[number];

export type TelegramMediaGroupCollectorType<
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
  _TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> = {
  collect(
    message: TMessage,
    options?: TelegramMediaCollectCallOptions,
  ): Promise<void>;
  flush(
    telegramChatId: GroupKey["chatId"],
    mediaGroupId: string,
  ): Promise<void>;
  discard(
    telegramChatId: GroupKey["chatId"],
    mediaGroupId: string,
  ): Promise<void>;
};
