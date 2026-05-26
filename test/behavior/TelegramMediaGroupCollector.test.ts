import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTelegramMediaGroup } from "../../src/index.js";
import { createMemoryMediaGroupStorage } from "../../src/storage/memory-storage.js";
import type { Message, Update } from "../../src/types/telegram-bot.types.js";

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

const createUpdate = (update: Partial<Update>): Update => ({
  update_id: 1,
  ...update,
});

describe("createTelegramMediaGroup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("collects updates from the message field", async () => {
    const onCollected = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
    });

    const message = createMessage(1, {
      caption: "hello",
    });

    await collector.collect(
      createUpdate({
        message,
      }),
    );

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected).toHaveBeenCalledWith({
      media: null,
      message,
    });
  });

  it("collects updates from the channel_post field", async () => {
    const onCollected = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
    });

    const message: Message = {
      message_id: 1,
      chat: {
        id: -100777,
        type: "channel",
        title: "Channel",
      },
      caption: "channel post",
    };

    await collector.collect(
      createUpdate({
        channel_post: message,
      }),
    );

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected).toHaveBeenCalledWith({
      media: null,
      message,
    });
  });

  it("throws for unsupported updates", async () => {
    const collector = createTelegramMediaGroup({
      onCollected: vi.fn(),
    });

    await expect(collector.collect(createUpdate({}))).rejects.toThrow(
      "Unsupported Telegram update. Expected message, channel_post, edited_message, or edited_channel_post.",
    );
  });

  it("uses default memory storage when no storage is provided", async () => {
    const onCollected = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
      timeoutMs: 1_500,
    });

    const firstMessage = createMessage(1, {
      media_group_id: "group-1",
      caption: "hello",
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

    await collector.collect(createUpdate({ message: firstMessage }));
    await collector.collect(createUpdate({ message: secondMessage }));
    await vi.advanceTimersByTimeAsync(1_500);

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected.mock.calls[0]?.[0]).toEqual({
      media: [
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
      ],
      message: firstMessage,
    });
  });

  it("flushes through the facade using a provided storage", async () => {
    const onCollected = vi.fn();
    const storage = createMemoryMediaGroupStorage<Message>();
    const collector = createTelegramMediaGroup({
      onCollected,
      storage,
      timeoutMs: 5_000,
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

    await collector.collect(createUpdate({ message }));
    await collector.flush(message.chat.id, "group-1");

    expect(onCollected).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(onCollected).toHaveBeenCalledTimes(1);
  });

  it("discards through the facade using a provided storage", async () => {
    const onCollected = vi.fn();
    const storage = createMemoryMediaGroupStorage<Message>();
    const collector = createTelegramMediaGroup({
      onCollected,
      storage,
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

    await collector.collect(createUpdate({ message }));
    await collector.discard(message.chat.id, "group-1");
    await vi.advanceTimersByTimeAsync(1_500);

    expect(onCollected).not.toHaveBeenCalled();
  });

  it("reports and throws by default when facade collection fails", async () => {
    const appendError = new Error("append failed");
    const storage = {
      get: vi.fn(),
      appendMessage: vi.fn().mockRejectedValue(appendError),
      delete: vi.fn(),
    };
    const onCollected = vi.fn();
    const onError = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
      onError,
      storage,
    });

    const message = createMessage(10, {
      media_group_id: "group-1",
    });

    await expect(
      collector.collect(createUpdate({ message })),
    ).rejects.toThrow("append failed");

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

  it("throws without reporting when facade errorMode is throw", async () => {
    const appendError = new Error("append failed");
    const storage = {
      get: vi.fn(),
      appendMessage: vi.fn().mockRejectedValue(appendError),
      delete: vi.fn(),
    };
    const onCollected = vi.fn();
    const onError = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
      onError,
      storage,
      errorMode: "throw",
    });

    const message = createMessage(10, {
      media_group_id: "group-1",
    });

    await expect(
      collector.collect(createUpdate({ message })),
    ).rejects.toThrow("append failed");

    expect(onCollected).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("reports without throwing when facade errorMode is report", async () => {
    const appendError = new Error("append failed");
    const storage = {
      get: vi.fn(),
      appendMessage: vi.fn().mockRejectedValue(appendError),
      delete: vi.fn(),
    };
    const onCollected = vi.fn();
    const onError = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
      onError,
      storage,
      errorMode: "report",
    });

    const message = createMessage(10, {
      media_group_id: "group-1",
    });

    await expect(
      collector.collect(createUpdate({ message })),
    ).resolves.toBeUndefined();

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

  it("throws for an invalid facade timeout", () => {
    expect(() =>
      createTelegramMediaGroup({
        onCollected: vi.fn(),
        timeoutMs: Number.POSITIVE_INFINITY,
      }),
    ).toThrow(
      "Invalid timeoutMs in collector options. Expected a finite number greater than 0.",
    );
  });
});
