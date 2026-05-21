import type { TelegramMediaFieldsConfig } from "../types/public-types.js";

/**
 * Helps TypeScript keep precise autocomplete and literal inference while you
 * build a `mediaFields` object outside of `createTelegramMediaGroup(...)`.
 */
export const defineTelegramMediaFields = <
  const TConfig extends TelegramMediaFieldsConfig,
>(
  config: TConfig,
): TConfig => config;
