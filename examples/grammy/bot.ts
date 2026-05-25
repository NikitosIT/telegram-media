import { Bot } from "grammy";
import {
  createRedisMediaGroupStorage,
  createTelegramMediaGroup,
  defineTelegramMediaFields,
  type RedisCommandClient,
} from "telegram-media";

// Replace this declaration with your real Redis client instance.
declare const redisClient: RedisCommandClient;

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (botToken === undefined) {
  throw new Error("Set TELEGRAM_BOT_TOKEN before launching the grammY example.");
}

const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "width", "height"],
  video: ["duration"],
});

// Create the collector once and reuse it across all incoming updates.
const collector = createTelegramMediaGroup({
  async onCollected(post) {
    // This is where you would save the normalized post,
    // enqueue it for downstream work, or hand it to your app services.
    console.log("Collected Telegram post from grammY", {
      chatId: post.message.chat.id,
      messageId: post.message.message_id,
      media: post.media,
      caption: post.message.caption ?? null,
    });
  },
  storage: createRedisMediaGroupStorage(redisClient),
  timeoutMs: 2000,
  supportedMediaTypes: ["photo", "video", "audio"],
  photoSize: "small",
  mediaFields,
  errorMode: "report",
  onError(error, context) {
    console.error("telegram-media grammY integration error", {
      error,
      operation: context.operation,
      groupKey: context.groupKey,
      messageId: context.messageId,
    });
  },
});

const bot = new Bot(botToken);

bot.catch((error) => {
  console.error("grammY middleware error", error.error);
});

bot.use(async (ctx, next) => {
  // Feed every incoming grammY update into telegram-media.
  await collector.collect(ctx.update);

  await next();
});

bot.command("start", async (ctx) => {
  await ctx.reply("Send a media group and telegram-media will collect it.");
});

export const launchBot = async () => {
  await bot.start();
};
