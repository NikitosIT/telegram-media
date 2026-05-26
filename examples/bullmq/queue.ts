import { Queue } from "bullmq";

import { bullmqConnection, TELEGRAM_POST_QUEUE_NAME } from "./shared.js";
import type { TelegramIngestionPost } from "./producer.js";

export type TelegramPostJobPayload = {
  chatId: TelegramIngestionPost["message"]["chat"]["id"];
  messageId: TelegramIngestionPost["message"]["message_id"];
  mediaGroupId: TelegramIngestionPost["message"]["media_group_id"] | null;
  caption: TelegramIngestionPost["message"]["caption"] | null;
  media: TelegramIngestionPost["media"];
  receivedAt: string;
};

export const telegramPostQueue = new Queue<TelegramPostJobPayload>(
  TELEGRAM_POST_QUEUE_NAME,
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1_000,
      },
      removeOnComplete: {
        age: 24 * 60 * 60,
        count: 1_000,
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60,
      },
    },
  },
);

export const closeTelegramPostQueue = async () => {
  await telegramPostQueue.close();
};
