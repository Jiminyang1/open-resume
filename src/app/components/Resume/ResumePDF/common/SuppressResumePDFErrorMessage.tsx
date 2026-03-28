"use client";

/**
 * Suppress ResumePDF development errors.
 * See ResumePDF doc string for context.
 */
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  const globalWindow = window as Window & {
    __openResumeConsolePatched?: boolean;
    __openResumeConsoleError?: typeof console.error;
    __openResumeConsoleWarn?: typeof console.warn;
  };

  const SUPPRESSED_WARNINGS = [
    "DOCUMENT",
    "PAGE",
    "TEXT",
    "VIEW",
    "string child outside <Text> component",
  ];
  const shouldSuppressWarning = (messages: unknown[]) =>
    messages.some(
      (message) =>
        typeof message === "string" &&
        SUPPRESSED_WARNINGS.some((entry) => message.includes(entry))
    );

  if (!globalWindow.__openResumeConsolePatched) {
    globalWindow.__openResumeConsolePatched = true;
    globalWindow.__openResumeConsoleError = console.error;
    globalWindow.__openResumeConsoleWarn = console.warn;

    console.error = function filterErrors(msg, ...args) {
      if (!shouldSuppressWarning([msg, ...args])) {
        globalWindow.__openResumeConsoleError?.(msg, ...args);
      }
    };

    console.warn = function filterWarnings(msg, ...args) {
      if (!shouldSuppressWarning([msg, ...args])) {
        globalWindow.__openResumeConsoleWarn?.(msg, ...args);
      }
    };
  }
}

export const SuppressResumePDFErrorMessage = () => {
  return <></>;
};
