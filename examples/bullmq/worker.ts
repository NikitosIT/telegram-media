import { QueueEvents, Worker, type Job } from "bullmq";

import { bullmqConnection, telegramPostQueueName } from "./shared.js";
import type { TelegramPostJobPayload } from "./queue.js";

const queueEvents = new QueueEvents(telegramPostQueueName, {
  connection: bullmqConnection,
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error("BullMQ queue job failed", {
    jobId,
    failedReason,
  });
});

queueEvents.on("completed", ({ jobId }) => {
  console.log("BullMQ queue job completed", { jobId });
});

const processTelegramPost = async (payload: TelegramPostJobPayload) => {
  const { chatId, messageId, media, caption, receivedAt } = payload;

  console.log("Processing normalized Telegram post", {
    receivedAt,
    chatId,
    messageId,
    media,
    caption,
  });
};

export const telegramPostWorker = new Worker<TelegramPostJobPayload>(
  telegramPostQueueName,
  async (job: Job<TelegramPostJobPayload>) => {
    await processTelegramPost(job.data);
  },
  {
    connection: bullmqConnection,
    concurrency: 10,
  },
);

telegramPostWorker.on("error", (error) => {
  console.error("BullMQ worker error", error);
});

telegramPostWorker.on("failed", (job, error) => {
  console.error("BullMQ worker job failed", {
    jobId: job?.id,
    name: job?.name,
    error,
  });
});

export const closeTelegramPostWorker = async () => {
  await telegramPostWorker.close();
  await queueEvents.close();
};
