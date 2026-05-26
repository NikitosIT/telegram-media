import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryMediaGroupStorage } from "../../src/storage/memory-storage.js";
import { mergePendingGroup } from "../../src/storage/pending-group.js";
import type { GroupKey } from "../../src/types/storage-contract.types.js";
import type { Message } from "../../src/types/telegram-bot.types.js";

const GROUP_KEY: GroupKey = {
  chatId: -100123,
  mediaGroupId: "group-1",
};

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
  media_group_id: "group-1",
  ...overrides,
});

describe("mergePendingGroup", () => {
  it("creates a new pending group from the first message", () => {
    const message = createMessage(10);

    const group = mergePendingGroup({
      groupKey: GROUP_KEY,
      message,
      existingGroup: null,
      resolvedTimeoutMs: 1500,
      now: 1_000,
    });

    expect(group).toEqual({
      groupKey: GROUP_KEY,
      messages: [message],
      createdAt: 1_000,
      updatedAt: 1_000,
      timeoutMs: 1500,
    });
  });

  it("sorts messages when appending to an existing group", () => {
    const first = createMessage(20);
    const second = createMessage(10);

    const existingGroup = mergePendingGroup({
      groupKey: GROUP_KEY,
      message: first,
      existingGroup: null,
      resolvedTimeoutMs: 1500,
      now: 1_000,
    });

    const nextGroup = mergePendingGroup({
      groupKey: GROUP_KEY,
      message: second,
      existingGroup,
      resolvedTimeoutMs: 1500,
      now: 2_000,
    });

    expect(nextGroup.messages.map((message) => message.message_id)).toEqual([
      10, 20,
    ]);
    expect(nextGroup.createdAt).toBe(1_000);
    expect(nextGroup.updatedAt).toBe(2_000);
  });

  it("replaces an existing message with the latest version for the same message_id", () => {
    const message = createMessage(10, {
      caption: "old caption",
    });
    const editedMessage = createMessage(10, {
      caption: "new caption",
    });

    const existingGroup = mergePendingGroup({
      groupKey: GROUP_KEY,
      message,
      existingGroup: null,
      resolvedTimeoutMs: 1500,
      now: 1_000,
    });

    const nextGroup = mergePendingGroup({
      groupKey: GROUP_KEY,
      message: editedMessage,
      existingGroup,
      resolvedTimeoutMs: 5_000,
      now: 2_000,
    });

    expect(nextGroup.messages).toHaveLength(1);
    expect(nextGroup.messages[0]).toEqual(editedMessage);
    expect(nextGroup.updatedAt).toBe(2_000);
    expect(nextGroup.timeoutMs).toBe(5_000);
  });
});

describe("createMemoryMediaGroupStorage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and returns a pending group after appendMessage", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();
    const message = createMessage(1);

    const group = await storage.appendMessage({
      groupKey: GROUP_KEY,
      message,
      now: Date.now(),
      defaultTimeoutMs: 1500,
      ttlGraceMs: 5000,
    });

    expect(group.messages.map((item) => item.message_id)).toEqual([1]);
    await expect(storage.get(GROUP_KEY)).resolves.toEqual(group);
  });

  it("reuses existing group timeout for subsequent messages", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();

    await storage.appendMessage({
      groupKey: GROUP_KEY,
      message: createMessage(1),
      now: Date.now(),
      defaultTimeoutMs: 3_000,
      ttlGraceMs: 5000,
    });

    const nextGroup = await storage.appendMessage({
      groupKey: GROUP_KEY,
      message: createMessage(2),
      now: Date.now() + 100,
      defaultTimeoutMs: 1500,
      ttlGraceMs: 5000,
    });

    expect(nextGroup.timeoutMs).toBe(3_000);
  });

  it("expires groups after timeoutMs plus ttlGraceMs", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();

    await storage.appendMessage({
      groupKey: GROUP_KEY,
      message: createMessage(1),
      now: Date.now(),
      defaultTimeoutMs: 1_000,
      ttlGraceMs: 500,
    });

    await expect(storage.get(GROUP_KEY)).resolves.not.toBeNull();

    vi.advanceTimersByTime(1_499);
    await expect(storage.get(GROUP_KEY)).resolves.not.toBeNull();

    vi.advanceTimersByTime(1);
    await expect(storage.get(GROUP_KEY)).resolves.toBeNull();
  });

  it("deletes a group explicitly", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();

    await storage.appendMessage({
      groupKey: GROUP_KEY,
      message: createMessage(1),
      now: Date.now(),
      defaultTimeoutMs: 1500,
      ttlGraceMs: 5000,
    });

    await storage.delete(GROUP_KEY);

    await expect(storage.get(GROUP_KEY)).resolves.toBeNull();
  });

  it("stores the latest message version when the same message_id is appended again", async () => {
    const storage = createMemoryMediaGroupStorage<Message>();

    await storage.appendMessage({
      groupKey: GROUP_KEY,
      message: createMessage(1, {
        caption: "old caption",
      }),
      now: Date.now(),
      defaultTimeoutMs: 1500,
      ttlGraceMs: 5000,
    });

    const group = await storage.appendMessage({
      groupKey: GROUP_KEY,
      message: createMessage(1, {
        caption: "new caption",
      }),
      now: Date.now() + 100,
      defaultTimeoutMs: 1500,
      ttlGraceMs: 5000,
    });

    expect(group.messages).toHaveLength(1);
    expect(group.messages[0]?.caption).toBe("new caption");
    expect(group.updatedAt).toBe(Date.now() + 100);
  });
});
