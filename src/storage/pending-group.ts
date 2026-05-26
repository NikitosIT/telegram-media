import type {
  GroupKey,
  StoredTelegramMediaGroup,
} from "../types/storage-contract.types.js";
import type {
  TelegramBotMessage,
  TelegramMediaGroupMessage,
} from "../types/public-types.js";

type MergePendingGroupParams<
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
> = {
  groupKey: GroupKey;
  message: TMessage;
  existingGroup: StoredTelegramMediaGroup<TMessage> | null;
  resolvedTimeoutMs: number;
  now: number;
};

export const mergePendingGroup = <
  TMessage extends TelegramMediaGroupMessage = TelegramBotMessage,
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

  const existingMessageIndex = nextGroup.messages.findIndex(
    (message) => message.message_id === params.message.message_id,
  );

  if (existingMessageIndex === -1) {
    nextGroup.messages = [...nextGroup.messages, params.message].sort(
      (left, right) => left.message_id - right.message_id,
    );
    nextGroup.updatedAt = params.now;
  } else {
    nextGroup.messages = nextGroup.messages.map((message, index) =>
      index === existingMessageIndex ? params.message : message,
    );
    nextGroup.updatedAt = params.now;
  }

  nextGroup.timeoutMs = params.resolvedTimeoutMs;

  return nextGroup;
};
