import { serializeGroupKey } from "../group-key/group-key.js";
import type {
  GroupKey,
  MediaGroupStorage,
  MediaGroupStorageAppendParams,
  StoredTelegramMediaGroup,
} from "../types/storage-contract.types.js";
import type { TelegramMediaGroupMessage } from "../types/public-types.js";
import { APPEND_MESSAGE_TO_GROUP_SCRIPT } from "./redis-storage.scripts.js";
import type {
  RedisCommandClient,
  RedisMediaGroupStorageOptions,
} from "./redis-storage.types.js";

export const createRedisMediaGroupStorage = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
>(
  client: RedisCommandClient,
  options: RedisMediaGroupStorageOptions = {},
): MediaGroupStorage<TMessage> => {
  const keyPrefix = options.keyPrefix ?? "telegram:media-group";

  const buildRedisKey = (groupKey: GroupKey): string =>
    `${keyPrefix}:${serializeGroupKey(groupKey)}`;

  const parseJsonReply = <TValue>(reply: unknown): TValue => {
    if (typeof reply !== "string") {
      throw new Error("Redis script returned a non-string reply.");
    }

    return JSON.parse(reply) as TValue;
  };

  return {
    async get(
      groupKey: GroupKey,
    ): Promise<StoredTelegramMediaGroup<TMessage> | null> {
      const raw = await client.get(buildRedisKey(groupKey));

      if (raw === null) {
        return null;
      }

      return JSON.parse(raw) as StoredTelegramMediaGroup<TMessage>;
    },

    async appendMessage(
      params: MediaGroupStorageAppendParams<TMessage>,
    ): Promise<StoredTelegramMediaGroup<TMessage>> {
      const reply = await client.eval(APPEND_MESSAGE_TO_GROUP_SCRIPT, {
        keys: [buildRedisKey(params.groupKey)],
        arguments: [
          JSON.stringify(params.message),
          String(params.message.message_id),
          JSON.stringify(params.groupKey),
          String(params.now),
          String(params.defaultTimeoutMs),
          params.timeoutMs === undefined ? "" : String(params.timeoutMs),
          String(params.ttlGraceMs),
        ],
      });

      return parseJsonReply<StoredTelegramMediaGroup<TMessage>>(reply);
    },

    async delete(groupKey: GroupKey): Promise<void> {
      await client.del(buildRedisKey(groupKey));
    },
  };
};
