import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTelegramMediaGroupCollector } from "../../src/collector/collector.core.js";
import { createMemoryMediaGroupStorage } from "../../src/storage/memory-storage.js";
import type {
  TelegramCollectedPost,
  TelegramMediaCollectorErrorContext,
} from "../../src/types/public-types.js";
import type { MediaGroupStorage } from "../../src/types/storage-contract.types.js";
import type { Message } from "../../src/types/telegram-bot.types.js";

const createMessage = (
  messageId: number,
  overrides: Partial<Message> = {},
): Message => ({
  message_id: messageId,
  chat: {
    id: -100123,
    type: "supergroup",
    title: "CryptoHub",
  },
  ...overrides,
});

describe("createTelegramMediaGroupCollector", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("collects a single message immediately", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const onCollected = vi.fn<(post: TelegramCollectedPost<Message>) => void>();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
    });

    const message = createMessage(1, {
      caption: "single message",
    });

    await collector.collect(message);

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected).toHaveBeenCalledWith({
      media: null,
      message,
    });
  });

  it("collects a media group after timeout and emits one combined post", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const onCollected = vi.fn<(post: TelegramCollectedPost<Message>) => void>();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      timeoutMs: 1_500,
    });

    const secondMessage = createMessage(2, {
      media_group_id: "group-1",
      video: {
        file_id: "video-2",
        file_unique_id: "video-2-unique",
        width: 1920,
        height: 1080,
        duration: 42,
      },
    });
    const firstMessage = createMessage(1, {
      media_group_id: "group-1",
      caption: "main caption",
      photo: [
        {
          file_id: "photo-1",
          width: 320,
          height: 240,
        },
      ],
    });

    await collector.collect(secondMessage);
    await collector.collect(firstMessage);

    expect(onCollected).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_500);

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected).toHaveBeenCalledWith({
      media: [
        {
          type: "photo",
          fileId: "photo-1",
          width: 320,
          height: 240,
        },
        {
          type: "video",
          fileId: "video-2",
          width: 1920,
          height: 1080,
          duration: 42,
        },
      ],
      message: firstMessage,
    });
  });

  it("flushes a pending group manually before the timeout", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const onCollected = vi.fn<(post: TelegramCollectedPost<Message>) => void>();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      timeoutMs: 5_000,
    });

    const firstMessage = createMessage(1, {
      media_group_id: "group-1",
      photo: [
        {
          file_id: "photo-1",
          width: 320,
          height: 240,
        },
      ],
    });
    const secondMessage = createMessage(2, {
      media_group_id: "group-1",
      voice: {
        file_id: "voice-1",
        file_unique_id: "voice-1-unique",
        duration: 18,
      },
    });

    await collector.collect(firstMessage);
    await collector.collect(secondMessage);
    await collector.flush(firstMessage.chat.id, "group-1");

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected.mock.calls[0]?.[0]?.media).toEqual([
      {
        type: "photo",
        fileId: "photo-1",
        width: 320,
        height: 240,
      },
      {
        type: "voice",
        fileId: "voice-1",
        duration: 18,
        mimeType: undefined,
      },
    ]);

    await vi.advanceTimersByTimeAsync(5_000);
    expect(onCollected).toHaveBeenCalledTimes(1);
  });

  it("discards a pending group and prevents auto-flush emission", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const onCollected = vi.fn<(post: TelegramCollectedPost<Message>) => void>();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      timeoutMs: 1_500,
    });

    const message = createMessage(1, {
      media_group_id: "group-1",
      photo: [
        {
          file_id: "photo-1",
          width: 320,
          height: 240,
        },
      ],
    });

    await collector.collect(message);
    await collector.discard(message.chat.id, "group-1");
    await vi.advanceTimersByTimeAsync(1_500);

    expect(onCollected).not.toHaveBeenCalled();
  });

  it("reports collect errors through onError", async () => {
    const appendError = new Error("append failed");
    const storage: MediaGroupStorage<Message> = {
      get: vi.fn(),
      appendMessage: vi.fn().mockRejectedValue(appendError),
      delete: vi.fn(),
    };
    const onCollected = vi.fn();
    const onError =
      vi.fn<
        (error: unknown, context: TelegramMediaCollectorErrorContext) => void
      >();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      onError,
    });

    const message = createMessage(10, {
      media_group_id: "group-1",
    });

    await expect(collector.collect(message)).rejects.toThrow("append failed");

    expect(onCollected).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(appendError, {
      operation: "collect",
      groupKey: {
        chatId: message.chat.id,
        mediaGroupId: "group-1",
      },
      messageId: 10,
    });
  });

  it("throws without reporting when errorMode is throw", async () => {
    const appendError = new Error("append failed");
    const storage: MediaGroupStorage<Message> = {
      get: vi.fn(),
      appendMessage: vi.fn().mockRejectedValue(appendError),
      delete: vi.fn(),
    };
    const onCollected = vi.fn();
    const onError = vi.fn();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      onError,
      errorMode: "throw",
    });

    const message = createMessage(10, {
      media_group_id: "group-1",
    });

    await expect(collector.collect(message)).rejects.toThrow("append failed");

    expect(onCollected).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("reports without throwing when errorMode is report", async () => {
    const appendError = new Error("append failed");
    const storage: MediaGroupStorage<Message> = {
      get: vi.fn(),
      appendMessage: vi.fn().mockRejectedValue(appendError),
      delete: vi.fn(),
    };
    const onCollected = vi.fn();
    const onError =
      vi.fn<
        (error: unknown, context: TelegramMediaCollectorErrorContext) => void
      >();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      onError,
      errorMode: "report",
    });

    const message = createMessage(10, {
      media_group_id: "group-1",
    });

    await expect(collector.collect(message)).resolves.toBeUndefined();

    expect(onCollected).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("reports auto-flush errors through onError", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const collectedError = new Error("collector callback failed");
    const onCollected = vi.fn().mockRejectedValue(collectedError);
    const onError =
      vi.fn<
        (error: unknown, context: TelegramMediaCollectorErrorContext) => void
      >();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      onError,
      timeoutMs: 1_500,
    });

    const message = createMessage(1, {
      media_group_id: "group-1",
      photo: [
        {
          file_id: "photo-1",
          width: 320,
          height: 240,
        },
      ],
    });

    await collector.collect(message);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(collectedError, {
      operation: "auto-flush",
      groupKey: {
        chatId: message.chat.id,
        mediaGroupId: "group-1",
      },
    });
  });

  it("does not emit unhandled throw semantics for auto-flush background errors", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const collectedError = new Error("collector callback failed");
    const onCollected = vi.fn().mockRejectedValue(collectedError);
    const onError = vi.fn();

    const collector = createTelegramMediaGroupCollector<Message>({
      storage,
      onCollected,
      onError,
      errorMode: "throw",
      timeoutMs: 1_500,
    });

    const message = createMessage(1, {
      media_group_id: "group-1",
      photo: [
        {
          file_id: "photo-1",
          width: 320,
          height: 240,
        },
      ],
    });

    await collector.collect(message);
    await vi.advanceTimersByTimeAsync(1_500);

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });
});
