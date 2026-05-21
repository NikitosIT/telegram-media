import type {
  TelegramCollectedMediaOutput,
  SupportedTelegramMediaType,
  TelegramCollectedMediaItem,
  TelegramCollectedPost,
  TelegramMediaFieldsConfig,
  TelegramMediaGroupMessage,
  TelegramPhotoSizePreference,
} from "../types/public-types.js";
import { withDefined } from "../helpers/defined-props.js";
import type { TelegramCollectedMediaOutputItem } from "./collector.types.js";

const isMediaTypeEnabled = (
  mediaType: SupportedTelegramMediaType,
  supportedMediaTypes?: SupportedTelegramMediaType[],
): boolean =>
  supportedMediaTypes === undefined || supportedMediaTypes.includes(mediaType);

const pickPhotosBySizePreference = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
>(
  photos: NonNullable<TMessage["photo"]>,
  photoSize: TelegramPhotoSizePreference,
) => {
  const sortedPhotos = [...photos].sort((left, right) => {
    const leftArea = left.width * left.height;
    const rightArea = right.width * right.height;

    return leftArea - rightArea;
  });
  const firstPhoto = sortedPhotos[0];
  const lastPhoto = sortedPhotos[sortedPhotos.length - 1];

  if (firstPhoto === undefined || lastPhoto === undefined) {
    return [];
  }

  if (photoSize === "all") {
    return sortedPhotos;
  }

  if (photoSize === "small") {
    return [firstPhoto];
  }

  if (photoSize === "medium") {
    return [sortedPhotos[Math.floor(sortedPhotos.length / 2)] ?? lastPhoto];
  }

  return [lastPhoto];
};

const projectMediaItem = <
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
>(
  mediaItem: TelegramCollectedMediaItem,
  mediaFields?: TMediaFields,
): TelegramCollectedMediaOutputItem<TMediaFields> => {
  const selectedFields = mediaFields?.[mediaItem.type];

  if (selectedFields === undefined) {
    return mediaItem as TelegramCollectedMediaOutputItem<TMediaFields>;
  }

  const projected: Record<string, unknown> = {
    type: mediaItem.type,
  };
  const source: Record<string, unknown> = mediaItem;

  for (const field of selectedFields) {
    projected[field] = source[field];
  }

  return projected as TelegramCollectedMediaOutputItem<TMediaFields>;
};

const toCollectedMediaOutput = <
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
>(
  mediaItems: TelegramCollectedMediaOutputItem<TMediaFields>[],
): TelegramCollectedMediaOutput<TMediaFields> =>
  (mediaItems.length > 0
    ? mediaItems
    : null) as TelegramCollectedMediaOutput<TMediaFields>;

const extractMessageMedia = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
>(
  message: TMessage,
  supportedMediaTypes?: SupportedTelegramMediaType[],
  photoSize: TelegramPhotoSizePreference = "big",
): TelegramCollectedMediaItem[] => {
  const mediaItems: TelegramCollectedMediaItem[] = [];

  if (
    isMediaTypeEnabled("photo", supportedMediaTypes) &&
    message.photo !== undefined &&
    message.photo.length > 0
  ) {
    const selectedPhotos = pickPhotosBySizePreference(message.photo, photoSize);
    const photoMediaItems: TelegramCollectedMediaItem[] = selectedPhotos.map(
      (photo) => ({
        type: "photo",
        fileId: photo.file_id,
        width: photo.width,
        height: photo.height,
      }),
    );

    mediaItems.push(...photoMediaItems);
  }

  if (
    isMediaTypeEnabled("video", supportedMediaTypes) &&
    message.video !== undefined
  ) {
    mediaItems.push({
      type: "video",
      fileId: message.video.file_id,
      width: message.video.width,
      height: message.video.height,
      duration: message.video.duration,
    });
  }

  if (
    isMediaTypeEnabled("document", supportedMediaTypes) &&
    message.document !== undefined
  ) {
    mediaItems.push({
      type: "document",
      fileId: message.document.file_id,
      ...withDefined(message.document.file_name, (fileName) => ({ fileName })),
      ...withDefined(message.document.mime_type, (mimeType) => ({ mimeType })),
      ...withDefined(message.document.file_size, (fileSize) => ({ fileSize })),
    });
  }

  if (
    isMediaTypeEnabled("audio", supportedMediaTypes) &&
    message.audio !== undefined
  ) {
    mediaItems.push({
      type: "audio",
      fileId: message.audio.file_id,
      duration: message.audio.duration,
      ...withDefined(message.audio.file_name, (fileName) => ({ fileName })),
      ...withDefined(message.audio.mime_type, (mimeType) => ({ mimeType })),
      ...withDefined(message.audio.performer, (performer) => ({ performer })),
      ...withDefined(message.audio.title, (title) => ({ title })),
    });
  }

  if (
    isMediaTypeEnabled("voice", supportedMediaTypes) &&
    message.voice !== undefined
  ) {
    mediaItems.push({
      type: "voice",
      fileId: message.voice.file_id,
      duration: message.voice.duration,
      ...withDefined(message.voice.mime_type, (mimeType) => ({ mimeType })),
    });
  }

  if (
    isMediaTypeEnabled("animation", supportedMediaTypes) &&
    message.animation !== undefined
  ) {
    mediaItems.push({
      type: "animation",
      fileId: message.animation.file_id,
      width: message.animation.width,
      height: message.animation.height,
      duration: message.animation.duration,
      ...withDefined(message.animation.file_name, (fileName) => ({ fileName })),
      ...withDefined(message.animation.mime_type, (mimeType) => ({ mimeType })),
    });
  }

  return mediaItems;
};

export const buildCollectedPost = <
  TMessage extends TelegramMediaGroupMessage = TelegramMediaGroupMessage,
  TMediaFields extends TelegramMediaFieldsConfig | undefined = undefined,
>(
  messages: TMessage[],
  options: {
    supportedMediaTypes?: SupportedTelegramMediaType[];
    photoSize?: TelegramPhotoSizePreference;
    mediaFields?: TMediaFields;
  },
): TelegramCollectedPost<TMessage, TMediaFields> => {
  if (messages.length === 0) {
    throw new Error(
      "Cannot build a collected post from an empty message list.",
    );
  }

  const sortedMessages = [...messages].sort(
    (left, right) => left.message_id - right.message_id,
  );

  const captionMessage =
    sortedMessages.find(
      (message) =>
        typeof message.caption === "string" && message.caption.length > 0,
    ) ?? null;

  const media = sortedMessages
    .flatMap((message) =>
      extractMessageMedia(
        message,
        options.supportedMediaTypes,
        options.photoSize,
      ),
    )
    .map((mediaItem) => projectMediaItem(mediaItem, options.mediaFields));

  return {
    media: toCollectedMediaOutput(media),
    message: captionMessage ?? sortedMessages[0]!,
  };
};
