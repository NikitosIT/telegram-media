export const assertValidTimeoutMs = (
  timeoutMs: number,
  source: "collector options" | "collect options",
): void => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(
      `Invalid timeoutMs in ${source}. Expected a finite number greater than 0.`,
    );
  }
};
