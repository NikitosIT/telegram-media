import type { TelegramMediaGroupMessage } from "../types/public-types.js";

export const UNSUPPORTED_UPDATE_ERROR_MESSAGE =
  "Unsupported Telegram update. Expected message, channel_post, edited_message, or edited_channel_post.";

export type TelegramMediaGroupUpdate<
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
> = {
  update_id: number;
  message?: TMessage;
  channel_post?: TMessage;
  edited_message?: TMessage;
  edited_channel_post?: TMessage;
};

export const getUpdateMessage = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
>(
  update: TelegramMediaGroupUpdate<TMessage>,
): TMessage | null =>
  update.message ??
  update.channel_post ??
  update.edited_message ??
  update.edited_channel_post ??
  null;
