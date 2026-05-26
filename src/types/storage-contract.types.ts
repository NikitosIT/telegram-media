import type {
  TelegramMediaCollectorErrorContext,
  TelegramMediaGroupMessage,
} from "./public-types.js";

/**
 * Stable identifier for a single Telegram media group inside a chat.
 */
export type GroupKey = NonNullable<
  TelegramMediaCollectorErrorContext["groupKey"]
>;

/**
 * Persisted representation of a media group while the collector is waiting
 * for the remaining Telegram updates to arrive.
 */
export type StoredTelegramMediaGroup<
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
> = {
  groupKey: GroupKey;
  messages: TMessage[];
  createdAt: number;
  updatedAt: number;
  timeoutMs: number;
};

export type MediaGroupStorageAppendParams<
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
> = {
  groupKey: GroupKey;
  message: TMessage;
  now: number;
  defaultTimeoutMs: number;
  ttlGraceMs: number;
};

export type MediaGroupStorage<
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
> = {
  get(groupKey: GroupKey): Promise<StoredTelegramMediaGroup<TMessage> | null>;
  appendMessage(
    params: MediaGroupStorageAppendParams<TMessage>,
  ): Promise<StoredTelegramMediaGroup<TMessage>>;
  delete(groupKey: GroupKey): Promise<void>;
};
