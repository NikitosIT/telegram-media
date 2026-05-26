import { serializeGroupKey } from "../group-key/group-key.js";
import type {
  GroupKey,
  MediaGroupStorageAppendParams,
  StoredTelegramMediaGroup,
} from "../types/storage-contract.types.js";
import type {
  TelegramBotMessage,
  TelegramMediaGroupMessage,
} from "../types/public-types.js";
import { mergePendingGroup } from "./pending-group.js";
import type { TimerHandle } from "../collector/collector.types.js";

export type MemoryMediaGroupStorageEntry<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
> = {
  expiresAt: number;
  group: StoredTelegramMediaGroup<TMessage>;
  cleanupTimer: TimerHandle;
};

export const createMemoryMediaGroupStorage = <
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
>() => {
  const store = new Map<string, MemoryMediaGroupStorageEntry<TMessage>>();

  const clearEntry = (serializedGroupKey: string): void => {
    const entry = store.get(serializedGroupKey);

    if (entry === undefined) {
      return;
    }

    clearTimeout(entry.cleanupTimer);
    store.delete(serializedGroupKey);
  };

  const getValidEntry = (groupKey: GroupKey) => {
    const serializedGroupKey = serializeGroupKey(groupKey);
    const entry = store.get(serializedGroupKey);

    if (entry === undefined) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      clearEntry(serializedGroupKey);
      return null;
    }

    return entry;
  };

  const saveGroup = (
    groupKey: GroupKey,
    group: StoredTelegramMediaGroup<TMessage>,
    ttlMs: number,
  ): void => {
    const serializedGroupKey = serializeGroupKey(groupKey);

    clearEntry(serializedGroupKey);

    const cleanupTimer = setTimeout(() => {
      clearEntry(serializedGroupKey);
    }, ttlMs);

    if (typeof cleanupTimer.unref === "function") {
      cleanupTimer.unref();
    }

    store.set(serializedGroupKey, {
      group,
      expiresAt: Date.now() + ttlMs,
      cleanupTimer,
    });
  };

  return {
    get(groupKey: GroupKey) {
      const entry = getValidEntry(groupKey);

      return Promise.resolve(entry?.group ?? null);
    },

    appendMessage(params: MediaGroupStorageAppendParams<TMessage>) {
      const existingGroup = getValidEntry(params.groupKey)?.group ?? null;
      const resolvedTimeoutMs =
        existingGroup?.timeoutMs ?? params.defaultTimeoutMs;

      const nextGroup = mergePendingGroup({
        groupKey: params.groupKey,
        message: params.message,
        existingGroup,
        resolvedTimeoutMs,
        now: params.now,
      });

      saveGroup(
        params.groupKey,
        nextGroup,
        resolvedTimeoutMs + params.ttlGraceMs,
      );

      return Promise.resolve(nextGroup);
    },

    delete(groupKey: GroupKey): Promise<void> {
      clearEntry(serializeGroupKey(groupKey));

      return Promise.resolve();
    },
  };
};
