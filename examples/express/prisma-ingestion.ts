import {
  createRedisMediaGroupStorage,
  createTelegramMediaGroup,
  defineTelegramMediaFields,
  type InferTelegramCollectorPost,
  type RedisCommandClient,
  type Update,
} from "telegram-media";

/**
 * Replace this object with your real Prisma client instance.
 * The example keeps it inline so you can focus on the telegram-media flow.
 */
const prisma = {
  telegramPost: {
    create: async (args: { data: any }) => {
      console.log("Persisting Telegram post with Prisma:", args.data);
    },
  },
};

/**
 * Replace this declaration with your real Redis client instance.
 *
 * For example:
 *
 * import { createClient } from "redis";
 *
 * const redisClient = createClient({
 *   url: process.env.REDIS_URL || "redis://localhost:6379",
 * });
 */
declare const redisClient: RedisCommandClient;

const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "height"],
  video: ["duration", "fileId"],
  audio: ["performer", "mimeType", "duration"],
});

const collector = createTelegramMediaGroup({
  async onCollected(post) {
    await prisma.telegramPost.create({
      data: mapCollectedPostToPrismaInput(post),
    });
  },
  storage: createRedisMediaGroupStorage(redisClient),
  timeoutMs: 3000,
  supportedMediaTypes: ["photo", "video", "audio"],
  photoSize: "small",
  mediaFields,
  errorMode: "report",
  onError(error, context) {
    console.error("telegram-media ingestion error", {
      error,
      operation: context.operation,
      groupKey: context.groupKey,
      messageId: context.messageId,
    });
  },
});

// If you move post processing outside of `onCollected`, infer the post type
// from your collector so the mapper stays in sync with its configuration.
type TelegramIngestionPost = InferTelegramCollectorPost<typeof collector>;

const mapCollectedPostToPrismaInput = (post: TelegramIngestionPost) => ({
  chat_id: post.message.chat.id,
  message_id: post.message.message_id,
  media_group_id: post.message.media_group_id ?? null,
  caption: post.message.caption ?? null,
  captionEntities: post.message.caption_entities,
  media: post.media,
});

export const handleTelegramUpdate = async (update: Update) => {
  await collector.collect(update);
};
