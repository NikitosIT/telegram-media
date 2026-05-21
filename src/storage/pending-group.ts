import type {
  GroupKey,
  StoredTelegramMediaGroup,
} from "../types/storage-contract.types.js";
import type { TelegramMediaGroupMessage } from "../types/public-types.js";

type MergePendingGroupParams<
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
> = {
  groupKey: GroupKey;
  message: TMessage;
  existingGroup: StoredTelegramMediaGroup<TMessage> | null;
  resolvedTimeoutMs: number;
  now: number;
};

export const mergePendingGroup = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
>(
  params: MergePendingGroupParams<TMessage>,
): StoredTelegramMediaGroup<TMessage> => {
  const nextGroup: StoredTelegramMediaGroup<TMessage> =
    params.existingGroup ?? {
      groupKey: params.groupKey,
      messages: [],
      createdAt: params.now,
      updatedAt: params.now,
      timeoutMs: params.resolvedTimeoutMs,
    };

  const duplicate = nextGroup.messages.some(
    (message) => message.message_id === params.message.message_id,
  );

  if (!duplicate) {
    nextGroup.messages = [...nextGroup.messages, params.message].sort(
      (left, right) => left.message_id - right.message_id,
    );
    nextGroup.updatedAt = params.now;
  }

  nextGroup.timeoutMs = params.resolvedTimeoutMs;

  return nextGroup;
};
