import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTelegramMediaGroup } from "../../src/index.js";
import type { Message, Update } from "../../src/types/telegram-bot.types.js";
import mixedMediaGroupUpdates from "../fixtures/telegram-media-group-mixed-updates.json" with { type: "json" };

describe("createTelegramMediaGroup realistic Telegram fixtures", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes a realistic media group payload with supportedMediaTypes, photoSize and mediaFields", async () => {
    const onCollected = vi.fn();
    const onError = vi.fn();
    const collector = createTelegramMediaGroup<
      Message,
      {
        photo: readonly ["fileId", "width"];
      }
    >({
      onCollected,
      onError,
      timeoutMs: 1_500,
      supportedMediaTypes: ["photo"],
      photoSize: "all",
      mediaFields: {
        photo: ["fileId", "width"],
      } as const,
    });

    for (const update of mixedMediaGroupUpdates as Update[]) {
      await collector.collect(update);
    }

    expect(onCollected).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_500);

    expect(onError).not.toHaveBeenCalled();
    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onCollected).toHaveBeenCalledWith({
      media: [
        {
          type: "photo",
          fileId: "photo-small-id-1091",
          width: 90,
        },
        {
          type: "photo",
          fileId: "photo-medium-id-1091",
          width: 320,
        },
        {
          type: "photo",
          fileId: "photo-big-id-1091",
          width: 720,
        },
      ],
      message: (mixedMediaGroupUpdates as Update[])[0]?.message,
    });
  });

  it("reports errors for a realistic payload when onCollected fails during auto-flush", async () => {
    const collectedError = new Error("save failed");
    const onCollected = vi.fn().mockRejectedValue(collectedError);
    const onError = vi.fn();
    const collector = createTelegramMediaGroup({
      onCollected,
      onError,
      timeoutMs: 1_500,
    });

    for (const update of mixedMediaGroupUpdates as Update[]) {
      await collector.collect(update);
    }

    await vi.advanceTimersByTimeAsync(1_500);

    expect(onCollected).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(collectedError, {
      operation: "auto-flush",
      groupKey: {
        chatId: -1003136275591,
        mediaGroupId: "14231523613415258",
      },
    });
  });
});
