When you work with the Telegram Bot API, it is easy to expect that a post with
multiple media files will arrive as a single event. In practice, Telegram sends
a separate `update` for each item in a media group. Because of that, the same
post can end up being stored as multiple database records, and you have to
manually merge them back into one entity, deal with duplicates, preserve the
correct order, and decide when the group is complete.

`telegram-media` solves exactly this problem. It is a Node.js library for
Telegram bots that accepts incoming `update` events, collects messages that
belong to the same media group, and returns one normalized post that is ready
for further processing.

Common use cases:

- save a Telegram post with multiple media files as a single database record
- publish one normalized payload to a queue or event bus instead of several
  raw Telegram updates
- run moderation, validation, or content processing on the full post
- repost or sync Telegram content to another service, CMS, or internal system
- archive and index complete Telegram posts for analytics or search

## Installation

```bash
npm install telegram-media
```

## Quick Start

`telegram-media` does not create or configure your Telegram bot. It is used in
the part of your application that already receives Telegram updates, such as a
webhook handler, a polling loop, or bot framework middleware.

```ts
import { createTelegramMediaGroup, type Update } from "telegram-media";

const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    // Handle the normalized Telegram post in your application
    console.log(post);
  },
});

// Call this function from the place where your bot receives Telegram updates.
export const handleTelegramUpdate = async (update: Update) => {
  await mediaGroup.collect(update);
};
```

In the simplest setup, you create a media group processor once and pass every
incoming Telegram `update` into `collect()`. If the update is a regular single
message, `onCollected` is called immediately. If the update belongs to a
Telegram media group, the library waits until the group is complete and then
returns a single normalized post instead of several separate updates.

## Understanding onCollected

`onCollected` is the main callback of the library. It is called when
`telegram-media` has finished preparing a single normalized post for your
application.

- If the incoming Telegram update contains a regular single message,
  `onCollected` is called immediately.
- If the update belongs to a Telegram media group, `telegram-media` waits until
  the group is complete and then calls `onCollected` once with the final
  collected result.

The callback receives one argument: `post`.

- `post.media` contains normalized media items extracted from the Telegram
  message or media group.
- `post.message` contains the original Telegram message object.

This split is useful because in most real applications you need both:

- normalized media data for saving files, building a clean payload, or storing
  a single post in your database
- the raw Telegram message for captions, chat metadata, message identifiers,
  and any other original Telegram fields

In other words, `telegram-media` normalizes the media part of the post, but it
does not hide the original Telegram message from you.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post.media);
    console.log(post.message.chat.id);
    console.log(post.message.caption);
  },
});
```

If a Telegram post contains supported media, `post.media` will contain a
normalized array of media items such as photos, videos, documents, audio,
voice, or animation. `post.message` remains the original Telegram message, so
you can still access fields like `chat.id`, `message_id`, `caption`, and any
other raw Telegram data you need in your application.

## collect(update)

Use `collect(update)` to pass every incoming Telegram `update` into the
library.

```ts
import { createTelegramMediaGroup, type Update } from "telegram-media";

const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
});

export const handleTelegramUpdate = async (update: Update) => {
  await mediaGroup.collect(update);
};
```

This is the main method you call during normal bot execution. In most cases,
your application should send every incoming Telegram update here.

## flush(chatId, mediaGroupId)

Use `flush(chatId, mediaGroupId)` when you want to finish a pending Telegram
media group immediately instead of waiting for the timeout.

In most applications, you will probably not need this method during normal bot
execution, but it is available when you want explicit control over pending
media group finalization.

```ts
import { createTelegramMediaGroup, type Message } from "telegram-media";

const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
});

export const flushMediaGroupFromMessage = async (message: Message) => {
  if (message.media_group_id === undefined) {
    return;
  }

  await mediaGroup.flush(message.chat.id, message.media_group_id);
};
```

This is useful when your application already knows that no more updates for the
same media group will arrive and you want to force final collection right now.
Use the original Telegram message values: `message.chat.id` and
`message.media_group_id`.

## discard(chatId, mediaGroupId)

Use `discard(chatId, mediaGroupId)` when you want to remove a pending Telegram
media group without calling `onCollected`.

In most applications, you will probably not need this method during normal bot
execution, but it is available when you intentionally want to drop a pending
media group before it is finalized.

```ts
import { createTelegramMediaGroup, type Message } from "telegram-media";

const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
});

export const discardMediaGroupFromMessage = async (message: Message) => {
  if (message.media_group_id === undefined) {
    return;
  }

  await mediaGroup.discard(message.chat.id, message.media_group_id);
};
```

This is useful when you intentionally want to drop a partially collected media
group and prevent it from being finalized later. Just like `flush`, this method
uses the original Telegram message values: `message.chat.id` and
`message.media_group_id`.

## Storage

`telegram-media` supports two storage strategies:

- memory storage
- Redis storage

Storage is used to temporarily keep pending Telegram media group parts until the
library has received enough updates to assemble them into one final collected
post. If a Telegram post contains several media files, Telegram sends them as
multiple separate updates, and storage is what allows `telegram-media` to keep
them together until the group is ready.

If you do not pass a custom `storage`, the library uses in-memory storage by
default.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
});
```

This is convenient for local development, simple bots, and cases where your
application runs as a single process.

If you pass a Redis storage adapter, the library stores pending media groups in
Redis instead of process memory.

```ts
import {
  createRedisMediaGroupStorage,
  createTelegramMediaGroup,
} from "telegram-media";

const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
  storage: createRedisMediaGroupStorage(redisClient),
});
```

For production usage, Redis is usually the better choice, especially when your
bot runs in multiple instances or when you do not want pending media groups to
be lost after a process restart. For local development, in-memory storage is
usually enough.

## timeoutMs

Use `timeoutMs` to control how long `telegram-media` should wait for the
remaining parts of a Telegram media group before finalizing it.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
  timeoutMs: 3000,
});
```

This is useful when you want to make media group collection more aggressive or
more tolerant depending on how your bot receives Telegram updates.

- a smaller value finalizes groups faster
- a larger value gives Telegram more time to deliver the remaining updates

If you do not pass `timeoutMs`, the default value is `1500` milliseconds.

## Media configuration

`telegram-media` lets you control which media should be collected and how the
final normalized media payload should look.

### supportedMediaTypes

Use `supportedMediaTypes` when you want to collect only specific Telegram media
types.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post.media);
  },
  supportedMediaTypes: ["photo", "video"],
});
```

In this example, photos and videos will be collected, while other supported
types such as documents, audio, voice, or animation will be ignored.

If you do not pass `supportedMediaTypes`, the library collects all supported
media types by default.

### photoSize

Telegram usually provides several sizes for the same photo. Use `photoSize` to
choose which version should be included in the normalized result.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post.media);
  },
  photoSize: "all",
});
```

Available options:

- `"small"` - use the smallest Telegram photo size
- `"medium"` - use the middle Telegram photo size
- `"big"` - use the largest Telegram photo size
- `"all"` - include every Telegram photo size as separate media items

Use `"all"` only when you really need every size variant. In most cases,
`"big"` is the most practical choice.

If you do not pass `photoSize`, the default value is `"big"`.

### mediaFields

Use `mediaFields` when you want to keep only specific fields in normalized
media items.

```ts
import {
  createTelegramMediaGroup,
  defineTelegramMediaFields,
} from "telegram-media";

const mediaFields = defineTelegramMediaFields({
  photo: ["fileId", "width", "height"],
  video: ["fileId", "duration"],
});

const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post.media);
  },
  mediaFields,
});
```

This is useful when you want a smaller and cleaner payload. For example, if
your application only needs `fileId` and a few metadata fields, you can exclude
everything else from the final normalized media output.

If your editor loses autocomplete while you type a larger `mediaFields` object
inline, `defineTelegramMediaFields(...)` can improve the authoring experience.

If you do not pass `mediaFields`, the library keeps the full normalized media
shape for each supported media item.

## errorMode

Use `errorMode` to control what the library should do when an operation fails.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
  errorMode: "report-and-throw",
  onError(error, context) {
    console.error(error, context);
  },
});
```

Available modes:

- `"report-and-throw"` - call `onError` and then rethrow the error
- `"report"` - call `onError` without rethrowing the error
- `"throw"` - rethrow the error without calling `onError`

In most cases, `"report-and-throw"` is the best default because it gives you
both logging and normal error propagation.

If you do not pass `errorMode`, the default value is `"report-and-throw"`.

## onError

Use `onError` when you want to react to errors produced by the library during
collection, manual flush, discard, or timeout-based media group finalization.
It is the callback part of the library error strategy, while `errorMode`
controls whether the error should also be rethrown.

```ts
const mediaGroup = createTelegramMediaGroup({
  onCollected(post) {
    console.log(post);
  },
  onError(error, context) {
    console.error(error);
    console.log(context.operation);
    console.log(context.groupKey);
    console.log(context.messageId);
  },
});
```

The callback receives:

- `error` - the original error
- `context.operation` - where the error happened
- `context.groupKey` - the related Telegram media group, when available
- `context.messageId` - the related Telegram message id, when available

`onError` is especially useful for logging, monitoring, and debugging
production issues.

If you do not pass `onError`, the library does not report errors through a
callback. In that case, the final behavior is controlled only by `errorMode`.

`onError` works together with `errorMode`:

- if `errorMode` is `"report-and-throw"`, `onError` is called and the error is
  rethrown after that
- if `errorMode` is `"report"`, `onError` is called and the error is not
  rethrown
- if `errorMode` is `"throw"`, the error is rethrown and `onError` is not
  called

## TypeScript types

`telegram-media` exports raw Telegram Bot API types that you can use in your
application, such as `Update`, `Message`, `PhotoSize`, `Video`, `Document`, and
other related Telegram objects.

These types are based on the Telegram Bot API objects used by the library, but
they are not intended to be a complete mirror of every Telegram type and field.
They cover the parts that are most useful for media group collection and common
bot integrations.

If you only need Telegram update and message typing in your bot code, you can
import them directly from the library:

```ts
import { type Message, type Update } from "telegram-media";
```

If your project adds extra fields to Telegram messages, you can extend the
default message type with `ExtendTelegramCollectorMessage` and use it in
`createTelegramMediaGroup`.

```ts
import {
  createTelegramMediaGroup,
  type ExtendTelegramCollectorMessage,
  type Update,
} from "telegram-media";

type MyTelegramMessage = ExtendTelegramCollectorMessage<{
  source: "webhook";
  internal_post_id: string;
}>;

const mediaGroup = createTelegramMediaGroup<MyTelegramMessage>({
  onCollected(post) {
    console.log(post.message.source);
    console.log(post.message.internal_post_id);
    console.log(post.message.caption);
  },
});

export const handleTelegramUpdate = async (update: Update) => {
  await mediaGroup.collect(update);
};
```

This is useful when your application enriches Telegram messages before passing
them into the library and you want those additional fields to stay fully typed
inside `onCollected`.

## More examples

You can find more complete usage examples in the `examples/` directory.

## Feedback and questions

If you have ideas for improvement, found a bug, or just have questions, feel
free to reach out:

- Telegram: `@Nikitos0055`
- Email: `nikitazavada463@gmail.com`

Built by: Nikita Zavada

## License

MIT
