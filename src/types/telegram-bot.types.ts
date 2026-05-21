/**
 * This file contains local Telegram Bot API types used by the library and the
 * project integration layer. The naming follows the official Telegram Bot API
 * objects so consumers can rely on familiar field names and autocomplete
 * without depending on external type packages.
 *
 * Source reference:
 * https://core.telegram.org/bots/api
 */

/**
 * This object represents a Telegram user or bot.
 */
export type User = {
  /** Unique identifier for this user or bot. */
  id: number;
  /** True, if this user is a bot. */
  is_bot: boolean;
  /** User's or bot's first name. */
  first_name: string;
  /** Optional. User's or bot's last name. */
  last_name?: string;
  /** Optional. User's or bot's username. */
  username?: string;
};

/**
 * This object represents a private chat with a user.
 */
export type PrivateChat = {
  /** Unique identifier for this chat. */
  id: number;
  /** Type of the chat, always "private". */
  type: "private";
  /** Optional. First name of the other party in a private chat. */
  first_name?: string;
  /** Optional. Last name of the other party in a private chat. */
  last_name?: string;
  /** Optional. Username of the other party in a private chat. */
  username?: string;
};

/**
 * This object represents a group chat.
 */
export type GroupChat = {
  /** Unique identifier for this chat. */
  id: number;
  /** Type of the chat, always "group". */
  type: "group";
  /** Title of the chat. */
  title: string;
};

/**
 * This object represents a supergroup chat.
 */
export type SupergroupChat = {
  /** Unique identifier for this chat. */
  id: number;
  /** Type of the chat, always "supergroup". */
  type: "supergroup";
  /** Title of the chat. */
  title: string;
  /** Optional. Username of the chat. */
  username?: string;
};

/**
 * This object represents a channel chat.
 */
export type ChannelChat = {
  /** Unique identifier for this chat. */
  id: number;
  /** Type of the chat, always "channel". */
  type: "channel";
  /** Title of the chat. */
  title: string;
  /** Optional. Username of the chat. */
  username?: string;
};

/**
 * This object represents a chat.
 */
export type Chat = PrivateChat | GroupChat | SupergroupChat | ChannelChat;

/**
 * This object represents one special entity in a text message.
 */
export type MessageEntity = {
  /** Type of the entity. */
  type: string;
  /** Offset in UTF-16 code units to the start of the entity. */
  offset: number;
  /** Length of the entity in UTF-16 code units. */
  length: number;
  /** Optional. For "text_link" only, URL that will be opened after user taps on the text. */
  url?: string;
  /** Optional. For "custom_emoji" only, unique identifier of the custom emoji. */
  custom_emoji_id?: string;
};

/**
 * This object represents one size of a photo or a file / sticker thumbnail.
 */
export type PhotoSize = {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id?: string;
  /** Photo width. */
  width: number;
  /** Photo height. */
  height: number;
  /** Optional. File size in bytes. */
  file_size?: number;
};

/**
 * This object represents a video file.
 */
export type Video = {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** Video width. */
  width: number;
  /** Video height. */
  height: number;
  /** Duration of the video in seconds. */
  duration: number;
  /** Optional. Original filename. */
  file_name?: string;
  /** Optional. MIME type of the file as defined by the sender. */
  mime_type?: string;
  /** Optional. File size in bytes. */
  file_size?: number;
};

/**
 * This object represents an audio file to be treated as music by the Telegram clients.
 */
export type Audio = {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** Duration of the audio in seconds. */
  duration: number;
  /** Optional. Performer of the audio as defined by the sender or by audio tags. */
  performer?: string;
  /** Optional. Title of the audio as defined by the sender or by audio tags. */
  title?: string;
  /** Optional. Original filename. */
  file_name?: string;
  /** Optional. MIME type of the file as defined by the sender. */
  mime_type?: string;
  /** Optional. File size in bytes. */
  file_size?: number;
};

/**
 * This object represents a general file.
 */
export type Document = {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** Optional. Original filename. */
  file_name?: string;
  /** Optional. MIME type of the file as defined by the sender. */
  mime_type?: string;
  /** Optional. File size in bytes. */
  file_size?: number;
};

/**
 * This object represents a voice note.
 */
export type Voice = {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** Duration of the audio in seconds. */
  duration: number;
  /** Optional. MIME type of the file as defined by the sender. */
  mime_type?: string;
  /** Optional. File size in bytes. */
  file_size?: number;
};

/**
 * This object represents an animation file.
 */
export type Animation = {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** Video width as defined by the sender. */
  width: number;
  /** Video height as defined by the sender. */
  height: number;
  /** Duration of the video in seconds. */
  duration: number;
  /** Optional. Original filename. */
  file_name?: string;
  /** Optional. MIME type of the file as defined by the sender. */
  mime_type?: string;
  /** Optional. File size in bytes. */
  file_size?: number;
};

/**
 * The message was originally sent by a known user.
 */
export type MessageOriginUser = {
  /** Type of the message origin, always "user". */
  type: "user";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** User that sent the message originally. */
  sender_user: User;
};

/**
 * The message was originally sent by an unknown user.
 */
export type MessageOriginHiddenUser = {
  /** Type of the message origin, always "hidden_user". */
  type: "hidden_user";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** Name of the user that sent the message originally. */
  sender_user_name: string;
};

/**
 * The message was originally sent on behalf of a chat to a group chat.
 */
export type MessageOriginChat = {
  /** Type of the message origin, always "chat". */
  type: "chat";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** Chat that sent the message originally. */
  sender_chat: Chat;
  /** Optional. For messages originally sent by an anonymous chat administrator, original message author signature. */
  author_signature?: string;
};

/**
 * The message was originally sent to a channel chat.
 */
export type MessageOriginChannel = {
  /** Type of the message origin, always "channel". */
  type: "channel";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** Channel chat to which the message was originally sent. */
  chat: ChannelChat;
  /** Unique message identifier inside the original chat. */
  message_id: number;
  /** Optional. Signature of the original post author. */
  author_signature?: string;
};

/**
 * This object describes the origin of a message.
 */
export type MessageOrigin =
  | MessageOriginUser
  | MessageOriginHiddenUser
  | MessageOriginChat
  | MessageOriginChannel;

/**
 * This object represents a message.
 * Only the subset needed by the library and project is modeled here.
 */
export type Message = {
  /** Unique message identifier inside this chat. */
  message_id: number;
  /** Optional. Sender of the message; omitted for channel posts sent to channels. */
  from?: User;
  /** Chat the message belongs to. */
  chat: Chat;
  /** Optional. Date the message was sent in Unix time. */
  date?: number;
  /** Optional. Information about the original message for forwarded messages. */
  forward_origin?: MessageOrigin;
  /** Optional. Unique identifier of a media message group this message belongs to. */
  media_group_id?: string;
  /** Optional. Caption for the animation, audio, document, photo, video or voice. */
  caption?: string;
  /** Optional. Special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Optional. Message is a photo; available sizes are provided. */
  photo?: PhotoSize[];
  /** Optional. Message is a video. */
  video?: Video;
  /** Optional. Message is a general file. */
  document?: Document;
  /** Optional. Message is an audio file treated as music. */
  audio?: Audio;
  /** Optional. Message is a voice note. */
  voice?: Voice;
  /** Optional. Message is an animation. */
  animation?: Animation;
};

/**
 * This object represents an incoming update.
 * At most one of the optional fields can be present in any given update.
 */
export type Update = {
  /** The update's unique identifier. */
  update_id: number;
  /** Optional. New incoming message of any kind. */
  message?: Message;
  /** Optional. New version of a message that is known to the bot and was edited. */
  edited_message?: Message;
  /** Optional. New incoming channel post of any kind. */
  channel_post?: Message;
  /** Optional. New version of a channel post that is known to the bot and was edited. */
  edited_channel_post?: Message;
};
