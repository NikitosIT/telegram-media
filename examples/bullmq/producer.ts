import {
  createTelegramMediaGroup,
  type InferTelegramCollectorPost,
  type Update,
} from "telegram-media";

import { mediaFields } from "./shared.js";
import { telegramPostQueue } from "./queue.js";

export type TelegramIngestionPost = InferTelegramCollectorPost<
  typeof collector
>;

const collector = createTelegramMediaGroup({
  async onCollected(post) {
    await telegramPostQueue.add("process-telegram-post", {
      chatId: post.message.chat.id,
      messageId: post.message.message_id,
      mediaGroupId: post.message.media_group_id ?? null,
      caption: post.message.caption ?? null,
      media: post.media,
      receivedAt: new Date().toISOString(),
    });
  },
  timeoutMs: 2500,
  supportedMediaTypes: ["photo", "video", "animation"],
  photoSize: "medium",
  mediaFields,
  errorMode: "report",
  onError(error, context) {
    console.error("telegram-media BullMQ producer error", {
      error,
      operation: context.operation,
      groupKey: context.groupKey,
      messageId: context.messageId,
    });
  },
});

export const handleTelegramUpdate = async (update: Update) => {
  await collector.collect(update);
};
