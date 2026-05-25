import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  createRedisMediaGroupStorage,
  createTelegramMediaGroup,
  type RedisCommandClient,
  type Update,
} from "telegram-media";

import { TelegramPost, type TelegramPostDocument } from "./ingestion.schema.js";

/**
 * Replace this declaration with your real Redis client instance.
 */
declare const redisClient: RedisCommandClient;

@Injectable()
export class TelegramIngestionService {
  // Create the collector once and reuse it for every incoming Telegram update.
  private readonly collector = this.createCollector();

  constructor(
    // Nest injects the Mongoose model registered in ingestion.module.ts.
    @InjectModel(TelegramPost.name)
    private readonly telegramPostModel: Model<TelegramPostDocument>,
  ) {}

  private createCollector() {
    return createTelegramMediaGroup({
      onCollected: async (post) => {
        await this.telegramPostModel.create({
          // Store an empty array for text-only posts instead of null.
          media: post.media ?? [],
          caption: post.message.caption ?? null,
        });
      },
      // Redis keeps pending media groups while Telegram sends them as separate updates.
      storage: createRedisMediaGroupStorage(redisClient),
      timeoutMs: 2000,
      supportedMediaTypes: ["photo", "video", "audio"],
      photoSize: "small",
      errorMode: "report",
      onError: (error, context) => {
        console.error("telegram-media NestJS ingestion error", {
          error,
          operation: context.operation,
          groupKey: context.groupKey,
          messageId: context.messageId,
        });
      },
    });
  }

  async handleTelegramUpdate(update: Update): Promise<void> {
    await this.collector.collect(update);
  }
}
