import type { TelegramMediaGroupCollector } from "../collector/TelegramMediaGroupCollector.js";
import type {
  Animation,
  Audio,
  Chat,
  Document,
  LinkPreviewOptions,
  Message,
  MessageEntity,
  PhotoSize,
  Video,
  Voice,
} from "./telegram-bot.types.js";

/**
 * Media item kinds that can be extracted from Telegram updates by the
 * collector. Use this type to narrow which media kinds should be included
 * in the final collected post.
 */
export type SupportedTelegramMediaType =
  | "photo"
  | "video"
  | "document"
  | "audio"
  | "voice"
  | "animation";

/**
 * Controls which Telegram photo variant should be picked from the size array.
 * Telegram usually sends multiple variants for the same photo. Use "all" to
 * keep every available size as separate collected photo items.
 */
export type TelegramPhotoSizePreference = "small" | "medium" | "big" | "all";

/**
 * Minimal message contract required by the collector. It intentionally keeps
 * only the Telegram fields needed to group updates and normalize supported
 * media, which makes it easier to interoperate with framework-specific types
 * such as Telegraf or grammY messages.
 */
export type TelegramMediaGroupMessage = {
  message_id: number;
  chat: Pick<Chat, "id">;
  media_group_id?: string;
  text?: string;
  entities?: MessageEntity[];
  caption?: string;
  caption_entities?: MessageEntity[];
  link_preview_options?: LinkPreviewOptions;
  photo?: PhotoSize[];
  video?: Video;
  document?: Document;
  audio?: Audio;
  voice?: Voice;
  animation?: Animation;
};

/**
 * Full local Telegram Bot API message model exported by the package for
 * consumers who want the richer raw Telegram shape in their own code.
 */
export type TelegramBotMessage = Message;

/**
 * Helper for consumers who want to enrich the collector message type with
 * additional Telegram fields or application-specific metadata.
 */
export type ExtendTelegramCollectorMessage<TExtra> = TelegramMediaGroupMessage &
  TExtra;

/**
 * Normalized media item returned by the collector. Each Telegram media kind
 * is projected into a compact library-specific shape.
 */
export type TelegramCollectedMediaItem =
  | {
      type: "photo";
      fileId: string;
      width: number;
      height: number;
    }
  | {
      type: "video";
      fileId: string;
      width: number;
      height: number;
      duration: number;
    }
  | {
      type: "document";
      fileId: string;
      fileName?: string;
      mimeType?: string;
      fileSize?: number;
    }
  | {
      type: "audio";
      fileId: string;
      duration: number;
      fileName?: string;
      mimeType?: string;
      performer?: string;
      title?: string;
    }
  | {
      type: "voice";
      fileId: string;
      duration: number;
      mimeType?: string;
    }
  | {
      type: "animation";
      fileId: string;
      width: number;
      height: number;
      duration: number;
      fileName?: string;
      mimeType?: string;
    };

export type TelegramCollectedMediaType = TelegramCollectedMediaItem["type"];

export type TelegramCollectedMediaItemByType = {
  [TType in TelegramCollectedMediaType]: Extract<
    TelegramCollectedMediaItem,
    { type: TType }
  >;
};

/**
 * Controls which fields should be kept for each media item type in the final
 * output. This lets consumers reduce payload size while preserving typing.
 */
export type TelegramMediaFieldsConfig = Partial<{
  [TType in TelegramCollectedMediaType]: readonly (keyof Omit<
    TelegramCollectedMediaItemByType[TType],
    "type"
  >)[];
}>;

type ProjectTelegramCollectedMediaItem<
  TType extends TelegramCollectedMediaType,
  TMediaFields extends TelegramMediaFieldsConfig,
> = TType extends keyof TMediaFields
  ? TMediaFields[TType] extends readonly (keyof Omit<
      TelegramCollectedMediaItemByType[TType],
      "type"
    >)[]
    ? Pick<
        TelegramCollectedMediaItemByType[TType],
        TMediaFields[TType][number] | "type"
      >
    : TelegramCollectedMediaItemByType[TType]
  : TelegramCollectedMediaItemByType[TType];

export type TelegramProjectedMediaItemUnion<
  TMediaFields extends TelegramMediaFieldsConfig,
> = {
  [TType in TelegramCollectedMediaType]: ProjectTelegramCollectedMediaItem<
    TType,
    TMediaFields
  >;
}[TelegramCollectedMediaType];

export type TelegramCollectedMediaItems<
  TMediaFields extends TelegramMediaFieldsConfig | undefined,
> = [TMediaFields] extends [TelegramMediaFieldsConfig]
  ? TelegramProjectedMediaItemUnion<TMediaFields>[]
  : TelegramCollectedMediaItem[];

export type TelegramCollectedMediaOutput<
  TMediaFields extends TelegramMediaFieldsConfig | undefined,
> = TelegramCollectedMediaItems<TMediaFields> | null;

/**
 * Final normalized value produced by the collector for either a single
 * message or a fully assembled media group.
 */
export type TelegramCollectedPost<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
> = {
  media: TelegramCollectedMediaOutput<TMediaFields>;
  message: TMessage;
};

/**
 * Controls how collector methods should behave when an operation fails.
 * "report-and-throw" is the default and is recommended for most library usage.
 */
export type TelegramMediaCollectorErrorMode =
  | "throw"
  | "report"
  | "report-and-throw";

/**
 * Metadata passed to `onError` so consumers can understand where a failure
 * happened and which Telegram group/message it was related to.
 */
export type TelegramMediaCollectorErrorContext = {
  operation: "collect" | "flush" | "auto-flush" | "discard";
  groupKey?: {
    chatId: number | string;
    mediaGroupId: string;
  };
  messageId?: number;
};

/**
 * Extracts the collected post type from a configured collector instance so
 * consumers can reuse the exact inferred output shape in their own code.
 */
export type InferTelegramCollectorPost<TCollector> =
  TCollector extends TelegramMediaGroupCollector<
    infer TMessage,
    infer TMediaFields
  >
    ? TelegramCollectedPost<TMessage, TMediaFields>
    : never;
