import { Telegraf } from "node_modules/telegraf/typings/index.js";
import {
  createRedisMediaGroupStorage,
  createTelegramMediaGroup,
  defineTelegramMediaFields,
  type RedisCommandClient,
} from "telegram-media";

//  * Replace this declaration with your real Redis client instance.
declare const redisClient: RedisCommandClient;

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (botToken === undefined) {
  throw new Error(
    "Set TELEGRAM_BOT_TOKEN before launching the Telegraf example.",
  );
}

const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "width", "height"],
  video: ["duration"],
});

// Create the collector once and reuse it for every incoming Telegram update.
const collector = createTelegramMediaGroup({
  async onCollected(post) {
    // This is the place where you would save the normalized post,
    // enqueue it for further processing, or pass it into your app services.
    console.log("Collected Telegram post from Telegraf", {
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
    console.error("telegram-media Telegraf integration error", {
      error,
      operation: context.operation,
      groupKey: context.groupKey,
      messageId: context.messageId,
    });
  },
});

const bot = new Telegraf(botToken);

bot.use(async (ctx, next) => {
  // Feed every incoming Telegraf update into telegram-media.
  await collector.collect(ctx.update);

  await next();
});

bot.command("start", async (ctx) => {
  await ctx.reply("Send a media group and telegram-media will collect it.");
});

export const launchBot = async () => {
  await bot.launch();
};
