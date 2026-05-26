import { defineTelegramMediaFields } from "telegram-media";

export const TELEGRAM_POST_QUEUE_NAME = "telegram-post-processing";

// BullMQ accepts plain Redis connection options. Point this at your real Redis
// instance in application code or replace it with env-driven config.
export const bullmqConnection = {
  host: "127.0.0.1",
  port: 6379,
};

export const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "width", "height"],
  video: ["fileId", "duration"],
  animation: ["fileId", "duration"],
});

export const EXAMPLE_JOB_NAMES = {
  PROCESS_TELEGRAM_POST: "process-telegram-post",
} as const;
