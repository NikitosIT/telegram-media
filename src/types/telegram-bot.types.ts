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
  /** Optional. IETF language tag of the user's language. */
  language_code?: string;
  /** Optional. True, if this user is a Telegram Premium user. */
  is_premium?: boolean;
  /** Optional. True, if this user added the bot to the attachment menu. */
  added_to_attachment_menu?: boolean;
  /** Optional. True, if the bot can be invited to groups. Returned only in getMe. */
  can_join_groups?: boolean;
  /** Optional. True, if privacy mode is disabled for the bot. Returned only in getMe. */
  can_read_all_group_messages?: boolean;
  /** Optional. True, if the bot supports guest queries. Returned only in getMe. */
  supports_guest_queries?: boolean;
  /** Optional. True, if the bot supports inline queries. Returned only in getMe. */
  supports_inline_queries?: boolean;
  /** Optional. True, if the bot can be connected to a user account to manage it. */
  can_connect_to_business?: boolean;
  /** Optional. True, if the bot has a main Web App. */
  has_main_web_app?: boolean;
  /** Optional. True, if the bot has forum topic mode enabled in private chats. */
  has_topics_enabled?: boolean;
  /** Optional. True, if the bot allows users to create and delete topics in private chats. */
  allows_users_to_create_topics?: boolean;
  /** Optional. True, if other bots can be created to be controlled by the bot. */
  can_manage_bots?: boolean;
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
  /** Optional. True, if the private chat has forum topic mode enabled. */
  is_forum?: boolean;
  /** Optional. True, if the chat is the direct messages chat of a channel. */
  is_direct_messages?: boolean;
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
  /** Optional. True, if the group has forum topic mode enabled. */
  is_forum?: boolean;
  /** Optional. True, if the chat is the direct messages chat of a channel. */
  is_direct_messages?: boolean;
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
  /** Optional. True, if the supergroup chat is a forum. */
  is_forum?: boolean;
  /** Optional. True, if the chat is the direct messages chat of a channel. */
  is_direct_messages?: boolean;
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
  /** Optional. True, if the channel chat has forum topic mode enabled. */
  is_forum?: boolean;
  /** Optional. True, if the chat is the direct messages chat of a channel. */
  is_direct_messages?: boolean;
};

/**
 * This object represents a chat.
 */
export type Chat = PrivateChat | GroupChat | SupergroupChat | ChannelChat;

/**
 * This object represents a location.
 */
export type Location = {
  longitude: number;
  latitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
};

/**
 * This object represents a chat photo.
 */
export type ChatPhoto = {
  small_file_id: string;
  small_file_unique_id: string;
  big_file_id: string;
  big_file_unique_id: string;
};

/**
 * This object describes a user's birthdate.
 */
export type Birthdate = {
  day: number;
  month: number;
  year?: number;
};

/**
 * This object describes a chat location.
 */
export type ChatLocation = {
  location: Location;
  address: string;
};

/**
 * This object describes the intro of a business account.
 */
export type BusinessIntro = {
  title?: string;
  message?: string;
};

/**
 * This object describes the location of a business.
 */
export type BusinessLocation = {
  address: string;
  location?: Location;
};

/**
 * This object describes a time interval in a business opening-hours entry.
 */
export type BusinessOpeningHoursInterval = {
  opening_minute: number;
  closing_minute: number;
};

/**
 * This object describes opening hours of a business.
 */
export type BusinessOpeningHours = {
  time_zone_name: string;
  opening_hours: BusinessOpeningHoursInterval[];
};

/**
 * This object describes a user rating.
 */
export type UserRating = {
  rating: number;
};

/**
 * This object describes default chat member permissions.
 */
export type ChatPermissions = {
  can_send_messages?: boolean;
  can_send_audios?: boolean;
  can_send_documents?: boolean;
  can_send_photos?: boolean;
  can_send_videos?: boolean;
  can_send_video_notes?: boolean;
  can_send_voice_notes?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
  can_edit_tag?: boolean;
};

/**
 * This object describes accepted gift types for a chat or user.
 */
export type AcceptedGiftTypes = {
  unlimited_gifts?: boolean;
  limited_gifts?: boolean;
  unique_gifts?: boolean;
  premium_subscription?: boolean;
};

/**
 * This object describes a color scheme based on a unique gift.
 */
export type UniqueGiftColors = {
  name_accent_color: number;
  background_gradient_top_color: number;
  background_gradient_bottom_color: number;
  message_accent_color: number;
  reply_header_accent_color: number;
  link_preview_accent_color: number;
};

/**
 * This object describes link preview options for text messages.
 */
export type LinkPreviewOptions = {
  /** Optional. URL to use for link preview generation. */
  url?: string;
  /** Optional. True, if the link preview is disabled. */
  is_disabled?: boolean;
  /** Optional. True, if the media in the preview must be shown in a small size. */
  prefer_small_media?: boolean;
  /** Optional. True, if the media in the preview must be shown in a large size. */
  prefer_large_media?: boolean;
  /** Optional. True, if the link preview must be shown above the message text. */
  show_above_text?: boolean;
};

/**
 * This object represents one special entity in a text message.
 */
export type MessageEntityType =
  | "mention"
  | "hashtag"
  | "cashtag"
  | "bot_command"
  | "url"
  | "email"
  | "phone_number"
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "spoiler"
  | "blockquote"
  | "expandable_blockquote"
  | "code"
  | "pre"
  | "text_link"
  | "text_mention"
  | "custom_emoji"
  | "date_time";

/**
 * This object represents one special entity in a text message.
 */
export type MessageEntity = {
  /** Type of the entity. */
  type: MessageEntityType;
  /** Offset in UTF-16 code units to the start of the entity. */
  offset: number;
  /** Length of the entity in UTF-16 code units. */
  length: number;
  /** Optional. For "text_link" only, URL that will be opened after user taps on the text. */
  url?: string;
  /** Optional. For "text_mention" only, the mentioned user. */
  user?: User;
  /** Optional. For "pre" only, the programming language of the entity text. */
  language?: string;
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
  /** Optional. Unique identifier of a message thread or forum topic to which the message belongs. */
  message_thread_id?: number;
  /** Optional. Information about the original message for forwarded messages. */
  forward_origin?: MessageOrigin;
  /** Optional. Sender of the message when sent on behalf of a chat. */
  sender_chat?: Chat;
  /** Optional. If the sender boosted the chat, the number of boosts added by the user. */
  sender_boost_count?: number;
  /** Optional. The bot that actually sent the message on behalf of the business account. */
  sender_business_bot?: User;
  /** Optional. Tag or custom title of the sender of the message. */
  sender_tag?: string;
  /** Optional. Date the message was last edited in Unix time. */
  edit_date?: number;
  /** Optional. Unique identifier of the business connection from which the message was received. */
  business_connection_id?: string;
  /** Optional. True, if the message is sent to a topic. */
  is_topic_message?: boolean;
  /** Optional. True, if the message is an automatic forward. */
  is_automatic_forward?: boolean;
  /** Optional. Signature of the post author or anonymous admin custom title. */
  author_signature?: string;
  /** Optional. The number of Telegram Stars paid to send the message. */
  paid_star_count?: number;
  /** Optional. Unique identifier of a media message group this message belongs to. */
  media_group_id?: string;
  /** Optional. For text messages, the actual UTF-8 text of the message. */
  text?: string;
  /** Optional. Special entities that appear in the text. */
  entities?: MessageEntity[];
  /** Optional. Options used for link preview generation for the message. */
  link_preview_options?: LinkPreviewOptions;
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
  /** Optional. True, if the caption must be shown above the media. */
  show_caption_above_media?: boolean;
  /** Optional. True, if the media is covered by a spoiler animation. */
  has_media_spoiler?: boolean;
};

/**
 * This object describes the current status of a business connection.
 */
export type BusinessConnection = {
  /** Unique identifier of the business connection. */
  id: string;
  /** Business account user that created the connection. */
  user: User;
  /** Identifier of a private chat with the business account. */
  user_chat_id: number;
  /** Date the connection was established in Unix time. */
  date: number;
  /** True, if the connection is currently enabled. */
  can_reply: boolean;
  /** True, if the connection is active. */
  is_enabled: boolean;
};

/**
 * This object is received when messages are deleted from a connected business account.
 */
export type BusinessMessagesDeleted = {
  /** Unique identifier of the business connection. */
  business_connection_id: string;
  /** Information about a chat in the business account. */
  chat: Chat;
  /** The list of identifiers of deleted messages. */
  message_ids: number[];
};

/**
 * This object represents a custom or built-in reaction.
 */
export type ReactionTypeEmoji = {
  /** Type of the reaction, always "emoji". */
  type: "emoji";
  /** Reaction emoji. */
  emoji: string;
};

/**
 * This object represents a custom emoji reaction.
 */
export type ReactionTypeCustomEmoji = {
  /** Type of the reaction, always "custom_emoji". */
  type: "custom_emoji";
  /** Custom emoji identifier. */
  custom_emoji_id: string;
};

/**
 * This object represents a paid reaction.
 */
export type ReactionTypePaid = {
  /** Type of the reaction, always "paid". */
  type: "paid";
};

/**
 * This object describes a reaction type.
 */
export type ReactionType =
  | ReactionTypeEmoji
  | ReactionTypeCustomEmoji
  | ReactionTypePaid;

/**
 * This object contains full information about a chat.
 */
export type ChatFullInfo = {
  id: number;
  type: Chat["type"];
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
  is_direct_messages?: boolean;
  accent_color_id: number;
  max_reaction_count: number;
  photo?: ChatPhoto;
  active_usernames?: string[];
  birthdate?: Birthdate;
  business_intro?: BusinessIntro;
  business_location?: BusinessLocation;
  business_opening_hours?: BusinessOpeningHours;
  personal_chat?: Chat;
  parent_chat?: Chat;
  available_reactions?: ReactionType[];
  background_custom_emoji_id?: string;
  profile_accent_color_id?: number;
  profile_background_custom_emoji_id?: string;
  emoji_status_custom_emoji_id?: string;
  emoji_status_expiration_date?: number;
  bio?: string;
  has_private_forwards?: boolean;
  has_restricted_voice_and_video_messages?: boolean;
  join_to_send_messages?: boolean;
  join_by_request?: boolean;
  description?: string;
  invite_link?: string;
  pinned_message?: Message;
  permissions?: ChatPermissions;
  accepted_gift_types: AcceptedGiftTypes;
  can_send_paid_media?: boolean;
  slow_mode_delay?: number;
  unrestrict_boost_count?: number;
  message_auto_delete_time?: number;
  has_aggressive_anti_spam_enabled?: boolean;
  has_hidden_members?: boolean;
  has_protected_content?: boolean;
  has_visible_history?: boolean;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
  custom_emoji_sticker_set_name?: string;
  linked_chat_id?: number;
  location?: ChatLocation;
  rating?: UserRating;
  first_profile_audio?: Audio;
  unique_gift_colors?: UniqueGiftColors;
  paid_message_star_count?: number;
};

/**
 * This object represents a change of a reaction on a message performed by a user.
 */
export type MessageReactionUpdated = {
  /** The chat containing the message the user reacted to. */
  chat: Chat;
  /** Unique identifier of the message inside the chat. */
  message_id: number;
  /** The user that changed the reaction, if available. */
  user?: User;
  /** The chat on behalf of which the reaction was changed, if available. */
  actor_chat?: Chat;
  /** Date of the change in Unix time. */
  date: number;
  /** Previous list of reaction types set by the user. */
  old_reaction: ReactionType[];
  /** New list of reaction types set by the user. */
  new_reaction: ReactionType[];
};

/**
 * This object represents an anonymous reaction count for a message.
 */
export type ReactionCount = {
  /** Type of the reaction. */
  type: ReactionType;
  /** Number of times the reaction was set. */
  total_count: number;
};

/**
 * This object represents reaction changes with anonymous reactions.
 */
export type MessageReactionCountUpdated = {
  /** The chat containing the message. */
  chat: Chat;
  /** Unique message identifier inside the chat. */
  message_id: number;
  /** Date of the change in Unix time. */
  date: number;
  /** List of reactions with anonymous reaction counts. */
  reactions: ReactionCount[];
};

/**
 * This object represents an incoming inline query.
 */
export type InlineQuery = {
  /** Unique identifier for this query. */
  id: string;
  /** Sender. */
  from: User;
  /** Text of the query. */
  query: string;
  /** Offset of the results to be returned. */
  offset: string;
  /** Optional. Sender location, only for bots that request user location. */
  location?: {
    longitude: number;
    latitude: number;
    horizontal_accuracy?: number;
    live_period?: number;
    heading?: number;
    proximity_alert_radius?: number;
  };
  /** Optional. Type of the chat from which the query was sent. */
  chat_type?: string;
};

/**
 * This object represents a result of an inline query that was chosen by the user.
 */
export type ChosenInlineResult = {
  /** Result identifier. */
  result_id: string;
  /** Sender. */
  from: User;
  /** Optional. Sender location, only for bots that require user location. */
  location?: InlineQuery["location"];
  /** Optional. Identifier of the sent inline message. */
  inline_message_id?: string;
  /** Query that was used to obtain the result. */
  query: string;
};

/**
 * This object describes a message that may be inaccessible to the bot.
 */
export type InaccessibleMessage = {
  /** Chat the message belongs to. */
  chat: Chat;
  /** Unique message identifier inside the chat. */
  message_id: number;
  /** Date is always 0 for inaccessible messages. */
  date: 0;
};

/**
 * This object describes a callback query message that can be accessible or inaccessible.
 */
export type MaybeInaccessibleMessage = Message | InaccessibleMessage;

/**
 * This object represents an incoming callback query from an inline keyboard button.
 */
export type CallbackQuery = {
  /** Unique identifier for this query. */
  id: string;
  /** Sender. */
  from: User;
  /** Optional. Message sent by the bot with the callback button. */
  message?: MaybeInaccessibleMessage;
  /** Optional. Identifier of the message sent via the bot in inline mode. */
  inline_message_id?: string;
  /** Global identifier corresponding to the chat where the button was pressed. */
  chat_instance: string;
  /** Optional. Data associated with the callback button. */
  data?: string;
  /** Optional. Short name of a Game to be returned. */
  game_short_name?: string;
};

/**
 * This object represents a shipping address.
 */
export type ShippingAddress = {
  country_code: string;
  state: string;
  city: string;
  street_line1: string;
  street_line2: string;
  post_code: string;
};

/**
 * This object represents information about an order.
 */
export type OrderInfo = {
  name?: string;
  phone_number?: string;
  email?: string;
  shipping_address?: ShippingAddress;
};

/**
 * This object represents an incoming shipping query.
 */
export type ShippingQuery = {
  id: string;
  from: User;
  invoice_payload: string;
  shipping_address: ShippingAddress;
};

/**
 * This object contains information about an incoming pre-checkout query.
 */
export type PreCheckoutQuery = {
  id: string;
  from: User;
  currency: string;
  total_amount: number;
  invoice_payload: string;
  shipping_option_id?: string;
  order_info?: OrderInfo;
};

/**
 * This object describes a paid media purchase event.
 */
export type PaidMediaPurchased = {
  from: User;
  paid_media_payload: string;
};

/**
 * This object contains information about one answer option in a poll.
 */
export type PollOption = {
  text: string;
  voter_count: number;
};

/**
 * This object represents an answer of a user in a non-anonymous poll.
 */
export type PollAnswer = {
  poll_id: string;
  voter_chat?: Chat;
  user?: User;
  option_ids: number[];
};

/**
 * This object contains information about a poll.
 */
export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  total_voter_count: number;
  is_closed: boolean;
  is_anonymous: boolean;
  type: string;
  allows_multiple_answers: boolean;
  correct_option_id?: number;
  explanation?: string;
  explanation_entities?: MessageEntity[];
  open_period?: number;
  close_date?: number;
};

/**
 * This object represents an invite link for a chat.
 */
export type ChatInviteLink = {
  invite_link: string;
  creator: User;
  creates_join_request: boolean;
  is_primary: boolean;
  is_revoked: boolean;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  pending_join_request_count?: number;
};

/**
 * This object contains information about one member of a chat.
 * The local model is intentionally simplified for update/webhook typing.
 */
export type ChatMember = {
  status: string;
  user: User;
};

/**
 * This object represents changes in the status of a chat member.
 */
export type ChatMemberUpdated = {
  chat: Chat;
  from: User;
  date: number;
  old_chat_member: ChatMember;
  new_chat_member: ChatMember;
  invite_link?: ChatInviteLink;
  via_join_request?: boolean;
  via_chat_folder_invite_link?: boolean;
};

/**
 * Represents a join request sent to a chat.
 */
export type ChatJoinRequest = {
  chat: Chat;
  from: User;
  user_chat_id: number;
  date: number;
  bio?: string;
  invite_link?: ChatInviteLink;
};

/**
 * This object describes the source of a chat boost.
 */
export type ChatBoostSourcePremium = {
  source: "premium";
  user: User;
};

/**
 * This object describes a gift code boost source.
 */
export type ChatBoostSourceGiftCode = {
  source: "gift_code";
  user: User;
};

/**
 * This object describes a giveaway boost source.
 */
export type ChatBoostSourceGiveaway = {
  source: "giveaway";
  giveaway_message_id: number;
  user?: User;
  is_unclaimed?: boolean;
};

/**
 * This object describes where a chat boost came from.
 */
export type ChatBoostSource =
  | ChatBoostSourcePremium
  | ChatBoostSourceGiftCode
  | ChatBoostSourceGiveaway;

/**
 * This object contains information about a chat boost.
 */
export type ChatBoost = {
  boost_id: string;
  add_date: number;
  expiration_date: number;
  source: ChatBoostSource;
};

/**
 * This object represents a chat boost that was added or changed.
 */
export type ChatBoostUpdated = {
  chat: Chat;
  boost: ChatBoost;
};

/**
 * This object represents a chat boost that was removed.
 */
export type ChatBoostRemoved = {
  chat: Chat;
  boost_id: string;
  remove_date: number;
  source: ChatBoostSource;
};

/**
 * This object represents a managed bot update.
 */
export type ManagedBotUpdated = {
  managed_bot_user: User;
};

/**
 * Telegram Bot API update type names.
 */
export type UpdateType =
  | "message"
  | "edited_message"
  | "channel_post"
  | "edited_channel_post"
  | "business_connection"
  | "business_message"
  | "edited_business_message"
  | "deleted_business_messages"
  | "guest_message"
  | "message_reaction"
  | "message_reaction_count"
  | "inline_query"
  | "chosen_inline_result"
  | "callback_query"
  | "shipping_query"
  | "pre_checkout_query"
  | "purchased_paid_media"
  | "poll"
  | "poll_answer"
  | "my_chat_member"
  | "chat_member"
  | "chat_join_request"
  | "chat_boost"
  | "removed_chat_boost"
  | "managed_bot";

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
  /** Optional. The bot was connected to or disconnected from a business account. */
  business_connection?: BusinessConnection;
  /** Optional. New message from a connected business account. */
  business_message?: Message;
  /** Optional. New version of a message from a connected business account. */
  edited_business_message?: Message;
  /** Optional. Messages were deleted from a connected business account. */
  deleted_business_messages?: BusinessMessagesDeleted;
  /** Optional. New guest message. */
  guest_message?: Message;
  /** Optional. A reaction to a message was changed by a user. */
  message_reaction?: MessageReactionUpdated;
  /** Optional. Anonymous reaction counts on a message were changed. */
  message_reaction_count?: MessageReactionCountUpdated;
  /** Optional. New incoming inline query. */
  inline_query?: InlineQuery;
  /** Optional. The result of an inline query that was chosen by a user. */
  chosen_inline_result?: ChosenInlineResult;
  /** Optional. New incoming callback query. */
  callback_query?: CallbackQuery;
  /** Optional. New incoming shipping query. */
  shipping_query?: ShippingQuery;
  /** Optional. New incoming pre-checkout query. */
  pre_checkout_query?: PreCheckoutQuery;
  /** Optional. A user purchased paid media with a non-empty payload. */
  purchased_paid_media?: PaidMediaPurchased;
  /** Optional. New poll state. */
  poll?: Poll;
  /** Optional. A user changed their answer in a non-anonymous poll. */
  poll_answer?: PollAnswer;
  /** Optional. The bot's chat member status was updated in a chat. */
  my_chat_member?: ChatMemberUpdated;
  /** Optional. A chat member's status was updated in a chat. */
  chat_member?: ChatMemberUpdated;
  /** Optional. A request to join the chat has been sent. */
  chat_join_request?: ChatJoinRequest;
  /** Optional. A chat boost was added or changed. */
  chat_boost?: ChatBoostUpdated;
  /** Optional. A boost was removed from a chat. */
  removed_chat_boost?: ChatBoostRemoved;
  /** Optional. A managed bot was created or updated. */
  managed_bot?: ManagedBotUpdated;
};

/**
 * This object describes the current status of a webhook.
 */
export type WebhookInfo = {
  /** Webhook URL, may be empty if webhook is not set up. */
  url: string;
  /** True, if a custom certificate was provided. */
  has_custom_certificate: boolean;
  /** Number of updates awaiting delivery. */
  pending_update_count: number;
  /** Optional. Currently used webhook IP address. */
  ip_address?: string;
  /** Optional. Unix time for the most recent delivery error. */
  last_error_date?: number;
  /** Optional. Human-readable message for the most recent delivery error. */
  last_error_message?: string;
  /** Optional. Unix time of the most recent synchronization error. */
  last_synchronization_error_date?: number;
  /** Optional. Maximum allowed number of simultaneous HTTPS connections. */
  max_connections?: number;
  /** Optional. List of update types the bot is subscribed to. */
  allowed_updates?: UpdateType[];
};

/**
 * This object describes parameters for the getUpdates method.
 */
export type GetUpdatesOptions = {
  /** Identifier of the first update to be returned. */
  offset?: number;
  /** Limits the number of updates to be retrieved. */
  limit?: number;
  /** Timeout in seconds for long polling. */
  timeout?: number;
  /** List of update types the bot should receive. */
  allowed_updates?: UpdateType[];
};

/**
 * Minimal local InputFile representation for Bot API method options.
 */
export type InputFile = string | Blob;

/**
 * This object describes parameters for the setWebhook method.
 */
export type SetWebhookOptions = {
  /** HTTPS URL to send updates to. Use an empty string to remove webhook integration. */
  url: string;
  /** Upload your public key certificate so the root certificate can be checked. */
  certificate?: InputFile;
  /** Fixed IP address for webhook delivery instead of DNS resolution. */
  ip_address?: string;
  /** Maximum allowed number of simultaneous HTTPS connections. */
  max_connections?: number;
  /** List of update types the bot should receive. */
  allowed_updates?: UpdateType[];
  /** Pass true to drop all pending updates. */
  drop_pending_updates?: boolean;
  /** Secret token sent in the X-Telegram-Bot-Api-Secret-Token header. */
  secret_token?: string;
};
