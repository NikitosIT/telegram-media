import type {
  TelegramMediaCollectorErrorContext,
  TelegramMediaCollectorErrorMode,
} from "../types/public-types.js";

type CollectorErrorReporter = (
  error: unknown,
  context: TelegramMediaCollectorErrorContext,
) => Promise<void> | void;

type CreateCollectorErrorHandlersOptions = {
  errorMode: TelegramMediaCollectorErrorMode;
  onError?: CollectorErrorReporter;
};

export const createCollectorErrorHandlers = ({
  errorMode,
  onError,
}: CreateCollectorErrorHandlersOptions) => {
  const reportError = async (
    error: unknown,
    context: TelegramMediaCollectorErrorContext,
  ): Promise<void> => {
    if (onError !== undefined) {
      await onError(error, context);
    }
  };

  const handlePublicError = async (
    error: unknown,
    context: TelegramMediaCollectorErrorContext,
  ): Promise<void> => {
    if (errorMode === "report" || errorMode === "report-and-throw") {
      await reportError(error, context);
    }

    if (errorMode === "throw" || errorMode === "report-and-throw") {
      throw error;
    }
  };

  const handleBackgroundError = async (
    error: unknown,
    context: TelegramMediaCollectorErrorContext,
  ): Promise<void> => {
    if (errorMode === "report" || errorMode === "report-and-throw") {
      await reportError(error, context);
    }
  };

  return {
    reportError,
    handlePublicError,
    handleBackgroundError,
  };
};
