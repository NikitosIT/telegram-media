import type { GroupKey } from "../types/storage-contract.types.js";

export const serializeGroupKey = ({ chatId, mediaGroupId }: GroupKey): string =>
  `${chatId}:${mediaGroupId}`;
