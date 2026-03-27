"use client";

/**
 * Suppress ResumePDF development errors.
 * See ResumePDF doc string for context.
 */
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  const consoleError = console.error;
  const SUPPRESSED_WARNINGS = ["DOCUMENT", "PAGE", "TEXT", "VIEW"];
  const shouldSuppressWarning = (messages: unknown[]) =>
    messages.some(
      (message) =>
        typeof message === "string" &&
        SUPPRESSED_WARNINGS.some((entry) => message.includes(entry))
    );

  console.error = function filterWarnings(msg, ...args) {
    if (!shouldSuppressWarning([msg, ...args])) {
      consoleError(msg, ...args);
    }
  };
}

export const SuppressResumePDFErrorMessage = () => {
  return <></>;
};
