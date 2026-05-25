import {
  createTelegramMediaGroup,
  defineTelegramMediaFields,
  type InferTelegramCollectorPost,
  type Update,
} from "telegram-media";

const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "width", "height"],
  video: ["fileId", "duration"],
  animation: ["fileId", "duration"],
});

const collector = createTelegramMediaGroup({
  async onCollected(post) {
    await enqueueTelegramPostForProcessing({
      post,
      receivedAt: new Date().toISOString(),
    });
  },
  timeoutMs: 2500,
  supportedMediaTypes: ["photo", "video", "animation"],
  photoSize: "medium",
  mediaFields,
  onError(error, context) {
    console.error("telegram-media worker pipeline error", {
      error,
      operation: context.operation,
    });
  },
});

type TelegramCollectedPost = InferTelegramCollectorPost<typeof collector>;

type TelegramPostProcessingPayload = {
  post: TelegramCollectedPost;
  receivedAt: string;
};

const processingQueue: TelegramPostProcessingPayload[] = [];

const enqueueTelegramPostForProcessing = async (
  payload: TelegramPostProcessingPayload,
) => {
  processingQueue.push(payload);
};

const processTelegramPost = async (payload: TelegramPostProcessingPayload) => {
  const { post, receivedAt } = payload;

  console.log("Processing normalized Telegram post", {
    receivedAt,
    chatId: post.message.chat.id,
    messageId: post.message.message_id,
    media: post.media,
    caption: post.message.caption ?? null,
  });
};

export const processTelegramPostQueue = async () => {
  while (processingQueue.length > 0) {
    const payload = processingQueue.shift();

    if (!payload) {
      return;
    }

    await processTelegramPost(payload);
  }
};

export const handleTelegramUpdate = async (update: Update) => {
  await collector.collect(update);
};
