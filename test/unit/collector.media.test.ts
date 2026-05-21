import { describe, expect, it } from "vitest";

import { buildCollectedPost } from "../../src/collector/collector.media.js";
import type {
  Message,
  PhotoSize,
  Video,
  Voice,
} from "../../src/types/telegram-bot.types.js";

const createPhoto = (overrides: Partial<PhotoSize> = {}): PhotoSize => ({
  file_id: "photo-file-id",
  width: 100,
  height: 100,
  ...overrides,
});

const createVideo = (overrides: Partial<Video> = {}): Video => ({
  file_id: "video-file-id",
  file_unique_id: "video-unique-id",
  width: 1920,
  height: 1080,
  duration: 30,
  ...overrides,
});

const createVoice = (overrides: Partial<Voice> = {}): Voice => ({
  file_id: "voice-file-id",
  file_unique_id: "voice-unique-id",
  duration: 12,
  ...overrides,
});

const createMessage = (overrides: Partial<Message> = {}): Message => ({
  message_id: 1,
  chat: {
    id: -100123,
    type: "supergroup",
    title: "CryptoHub",
  },
  ...overrides,
});

describe("buildCollectedPost", () => {
  it("uses the caption message as the main post message when one exists", () => {
    const firstMessage = createMessage({
      message_id: 2,
      media_group_id: "group-1",
      photo: [createPhoto({ file_id: "photo-2" })],
    });
    const captionMessage = createMessage({
      message_id: 1,
      media_group_id: "group-1",
      caption: "Main caption",
      photo: [createPhoto({ file_id: "photo-1" })],
    });

    const post = buildCollectedPost([firstMessage, captionMessage], {});

    expect(post.message.message_id).toBe(1);
    expect(post.message.caption).toBe("Main caption");
  });

  it("falls back to the first sorted message when no caption exists", () => {
    const laterMessage = createMessage({
      message_id: 5,
      media_group_id: "group-1",
      photo: [createPhoto({ file_id: "photo-5" })],
    });
    const firstMessage = createMessage({
      message_id: 3,
      media_group_id: "group-1",
      photo: [createPhoto({ file_id: "photo-3" })],
    });

    const post = buildCollectedPost([laterMessage, firstMessage], {});

    expect(post.message.message_id).toBe(3);
  });

  it("collects media from multiple messages into one normalized media array", () => {
    const photoMessage = createMessage({
      message_id: 1,
      media_group_id: "group-1",
      photo: [createPhoto({ file_id: "photo-1", width: 320, height: 240 })],
    });
    const videoMessage = createMessage({
      message_id: 2,
      media_group_id: "group-1",
      video: createVideo({
        file_id: "video-1",
        width: 1280,
        height: 720,
        duration: 45,
      }),
    });
    const voiceMessage = createMessage({
      message_id: 3,
      media_group_id: "group-1",
      voice: createVoice({
        file_id: "voice-1",
        duration: 18,
        mime_type: "audio/ogg",
      }),
    });

    const post = buildCollectedPost(
      [voiceMessage, videoMessage, photoMessage],
      {},
    );

    expect(post.media).toEqual([
      {
        type: "photo",
        fileId: "photo-1",
        width: 320,
        height: 240,
      },
      {
        type: "video",
        fileId: "video-1",
        width: 1280,
        height: 720,
        duration: 45,
      },
      {
        type: "voice",
        fileId: "voice-1",
        duration: 18,
        mimeType: "audio/ogg",
      },
    ]);
  });

  it("filters media by supportedMediaTypes", () => {
    const photoMessage = createMessage({
      message_id: 1,
      media_group_id: "group-1",
      photo: [createPhoto({ file_id: "photo-1" })],
    });
    const videoMessage = createMessage({
      message_id: 2,
      media_group_id: "group-1",
      video: createVideo({ file_id: "video-1" }),
    });

    const post = buildCollectedPost([photoMessage, videoMessage], {
      supportedMediaTypes: ["video"],
    });

    expect(post.media).toEqual([
      {
        type: "video",
        fileId: "video-1",
        width: 1920,
        height: 1080,
        duration: 30,
      },
    ]);
  });

  it("respects photoSize='all' and keeps every photo variant", () => {
    const message = createMessage({
      media_group_id: "group-1",
      photo: [
        createPhoto({ file_id: "photo-small", width: 100, height: 100 }),
        createPhoto({ file_id: "photo-medium", width: 400, height: 400 }),
        createPhoto({ file_id: "photo-big", width: 900, height: 900 }),
      ],
    });

    const post = buildCollectedPost([message], {
      photoSize: "all",
    });

    expect(post.media).toEqual([
      {
        type: "photo",
        fileId: "photo-small",
        width: 100,
        height: 100,
      },
      {
        type: "photo",
        fileId: "photo-medium",
        width: 400,
        height: 400,
      },
      {
        type: "photo",
        fileId: "photo-big",
        width: 900,
        height: 900,
      },
    ]);
  });

  it("projects media fields when mediaFields are configured", () => {
    const photoMessage = createMessage({
      message_id: 1,
      media_group_id: "group-1",
      photo: [createPhoto({ file_id: "photo-1", width: 320, height: 240 })],
    });
    const voiceMessage = createMessage({
      message_id: 2,
      media_group_id: "group-1",
      voice: createVoice({
        file_id: "voice-1",
        duration: 18,
        mime_type: "audio/ogg",
      }),
    });

    const post = buildCollectedPost([photoMessage, voiceMessage], {
      mediaFields: {
        photo: ["fileId", "width"],
        voice: ["fileId"],
      } as const,
    });

    expect(post.media).toEqual([
      {
        type: "photo",
        fileId: "photo-1",
        width: 320,
      },
      {
        type: "voice",
        fileId: "voice-1",
      },
    ]);
  });

  it("returns null media when no supported media exists in the messages", () => {
    const message = createMessage({
      caption: "text only",
    });

    const post = buildCollectedPost([message], {});

    expect(post.media).toBeNull();
    expect(post.message.caption).toBe("text only");
  });
});
