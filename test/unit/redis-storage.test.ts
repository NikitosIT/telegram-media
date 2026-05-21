import { describe, expect, it, vi } from "vitest";

import { createRedisMediaGroupStorage } from "../../src/storage/redis-storage.js";
import { APPEND_MESSAGE_TO_GROUP_SCRIPT } from "../../src/storage/redis-storage.scripts.js";
import type { RedisCommandClient } from "../../src/storage/redis-storage.types.js";
import type { GroupKey } from "../../src/types/storage-contract.types.js";
import type { Message } from "../../src/types/telegram-bot.types.js";

const GROUP_KEY: GroupKey = {
  chatId: -100123,
  mediaGroupId: "group-1",
};

const createMessage = (messageId: number): Message => ({
  message_id: messageId,
  chat: {
    id: -100123,
    type: "supergroup",
    title: "CryptoHub",
  },
  media_group_id: "group-1",
});

const createStoredGroup = (message: Message) => ({
  groupKey: GROUP_KEY,
  messages: [message],
  createdAt: 1_000,
  updatedAt: 1_000,
  timeoutMs: 1_500,
});

const createRedisClient = () => {
  const evalMock = vi.fn();
  const getMock = vi.fn();
  const setMock = vi.fn();
  const delMock = vi.fn();

  const client: RedisCommandClient = {
    eval: evalMock,
    get: getMock,
    set: setMock,
    del: delMock,
  };

  return {
    client,
    evalMock,
    getMock,
    setMock,
    delMock,
  };
};

describe("createRedisMediaGroupStorage", () => {
  it("returns null when Redis has no group for the key", async () => {
    const { client, getMock } = createRedisClient();
    getMock.mockResolvedValue(null);
    const storage = createRedisMediaGroupStorage<Message>(client);

    await expect(storage.get(GROUP_KEY)).resolves.toBeNull();
    expect(getMock).toHaveBeenCalledWith(
      "telegram:media-group:-100123:group-1",
    );
  });

  it("parses a stored group returned by Redis get", async () => {
    const { client, getMock } = createRedisClient();
    const group = createStoredGroup(createMessage(10));
    getMock.mockResolvedValue(JSON.stringify(group));
    const storage = createRedisMediaGroupStorage<Message>(client);

    await expect(storage.get(GROUP_KEY)).resolves.toEqual(group);
  });

  it("calls eval with the append script and serialized arguments", async () => {
    const { client, evalMock } = createRedisClient();
    const message = createMessage(10);
    const group = createStoredGroup(message);
    evalMock.mockResolvedValue(JSON.stringify(group));
    const storage = createRedisMediaGroupStorage<Message>(client, {
      keyPrefix: "custom-prefix",
    });

    const result = await storage.appendMessage({
      groupKey: GROUP_KEY,
      message,
      now: 5_000,
      defaultTimeoutMs: 1_500,
      timeoutMs: 2_000,
      ttlGraceMs: 5_000,
    });

    expect(result).toEqual(group);
    expect(evalMock).toHaveBeenCalledWith(APPEND_MESSAGE_TO_GROUP_SCRIPT, {
      keys: ["custom-prefix:-100123:group-1"],
      arguments: [
        JSON.stringify(message),
        "10",
        JSON.stringify(GROUP_KEY),
        "5000",
        "1500",
        "2000",
        "5000",
      ],
    });
  });

  it("passes an empty timeout override marker when timeoutMs is omitted", async () => {
    const { client, evalMock } = createRedisClient();
    const message = createMessage(11);
    const group = createStoredGroup(message);
    evalMock.mockResolvedValue(JSON.stringify(group));
    const storage = createRedisMediaGroupStorage<Message>(client);

    await storage.appendMessage({
      groupKey: GROUP_KEY,
      message,
      now: 6_000,
      defaultTimeoutMs: 1_500,
      ttlGraceMs: 5_000,
    });

    expect(evalMock).toHaveBeenCalledWith(APPEND_MESSAGE_TO_GROUP_SCRIPT, {
      keys: ["telegram:media-group:-100123:group-1"],
      arguments: [
        JSON.stringify(message),
        "11",
        JSON.stringify(GROUP_KEY),
        "6000",
        "1500",
        "",
        "5000",
      ],
    });
  });

  it("throws a clear error when the Redis script reply is not a string", async () => {
    const { client, evalMock } = createRedisClient();
    evalMock.mockResolvedValue(123);
    const storage = createRedisMediaGroupStorage<Message>(client);

    await expect(
      storage.appendMessage({
        groupKey: GROUP_KEY,
        message: createMessage(12),
        now: 7_000,
        defaultTimeoutMs: 1_500,
        ttlGraceMs: 5_000,
      }),
    ).rejects.toThrow("Redis script returned a non-string reply.");
  });

  it("deletes a group using the prefixed Redis key", async () => {
    const { client, delMock } = createRedisClient();
    delMock.mockResolvedValue(1);
    const storage = createRedisMediaGroupStorage<Message>(client, {
      keyPrefix: "custom-prefix",
    });

    await storage.delete(GROUP_KEY);

    expect(delMock).toHaveBeenCalledWith("custom-prefix:-100123:group-1");
  });
});

describe("APPEND_MESSAGE_TO_GROUP_SCRIPT", () => {
  it("contains the core atomic append steps", () => {
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain('redis.call("GET", key)');
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain("local duplicate = false");
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain(
      "table.insert(group.messages, cjson.decode(messageJson))",
    );
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain(
      "group.messages[index].message_id",
    );
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain(
      "table.sort(group.messages, function(left, right)",
    );
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain('"SET"');
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain('"PX"');
    expect(APPEND_MESSAGE_TO_GROUP_SCRIPT).toContain(
      "resolvedTimeoutMs + ttlGraceMs",
    );
  });
});
