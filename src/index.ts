export { createTelegramMediaGroup } from "./collector/TelegramMediaGroupCollector.js";
export { createMemoryMediaGroupStorage } from "./storage/memory-storage.js";
export { createRedisMediaGroupStorage } from "./storage/redis-storage.js";
export { defineTelegramMediaFields } from "./helpers/media-fields.js";
export type {
  ExtendTelegramCollectorMessage,
  InferTelegramCollectorPost,
  SupportedTelegramMediaType,
  TelegramCollectedPost,
  TelegramMediaCollectorErrorContext,
  TelegramMediaCollectorErrorMode,
  TelegramMediaFieldsConfig,
  TelegramPhotoSizePreference,
} from "./types/public-types.js";
export type {
  GroupKey,
  MediaGroupStorage,
  MediaGroupStorageAppendParams,
  StoredTelegramMediaGroup,
} from "./types/storage-contract.types.js";
export type {
  RedisCommandClient,
  RedisMediaGroupStorageOptions,
} from "./storage/redis-storage.types.js";
export type {
  Animation,
  Audio,
  ChannelChat,
  Chat,
  Document,
  GroupChat,
  Message,
  MessageEntity,
  MessageOrigin,
  MessageOriginChannel,
  MessageOriginChat,
  MessageOriginHiddenUser,
  MessageOriginUser,
  PhotoSize,
  PrivateChat,
  SupergroupChat,
  Update,
  User,
  Video,
  Voice,
} from "./types/telegram-bot.types.js";
