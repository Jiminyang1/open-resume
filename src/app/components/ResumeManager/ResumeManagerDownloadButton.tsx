"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { pdf } from "@react-pdf/renderer";
import { ResumePDF } from "components/Resume/ResumePDF";
import { buildResumeLayout } from "components/Resume/ResumePDF/layout";
import {
  findBestFitScale,
  getAutoFitScaleBounds,
} from "components/Resume/auto-fit";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import { cx } from "lib/cx";
import { getPdfPageCount } from "lib/get-pdf-page-count";
import type { SavedResume } from "lib/redux/local-storage";

const getDownloadFileName = (savedResume: SavedResume) => {
  const fileName = savedResume.resume.profile.name.trim() || savedResume.title;
  return `${fileName || "Resume"} - Resume.pdf`;
};

const getResumeLayoutForDownload = async (savedResume: SavedResume) => {
  const { resume, settings } = savedResume;
  const manualLayout = buildResumeLayout({
    fontSize: settings.fontSize,
  });

  if (!settings.autoFitOnePage) {
    return manualLayout;
  }

  try {
    const { minScale, maxScale } = getAutoFitScaleBounds();
    const measurePageCount = async (fitScale: number) => {
      const candidateLayout = buildResumeLayout({
        fontSize: settings.fontSize,
        fitScale,
        enforceAtsBoundaries: true,
      });
      const candidateDocument = (
        <ResumePDF
          resume={resume}
          settings={settings}
          layout={candidateLayout}
          isPDF={true}
        />
      );
      const blob = await pdf(candidateDocument).toBlob();
      return getPdfPageCount(blob);
    };

    const { scale } = await findBestFitScale({
      minScale,
      maxScale,
      measurePageCount,
    });

    return buildResumeLayout({
      fontSize: settings.fontSize,
      fitScale: scale,
      enforceAtsBoundaries: true,
    });
  } catch (error) {
    console.error("Failed to auto-fit resume before download", error);
    return manualLayout;
  }
};

export type ResumeManagerDownloadButtonProps = {
  savedResume: SavedResume;
  className?: string;
};

export const ResumeManagerDownloadButton = ({
  savedResume,
  className,
}: ResumeManagerDownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(savedResume.settings.fontFamily);

  const onDownload = async () => {
    try {
      setIsDownloading(true);
      const layout = await getResumeLayoutForDownload(savedResume);
      const resumeDocument = (
        <ResumePDF
          resume={savedResume.resume}
          settings={savedResume.settings}
          layout={layout}
          isPDF={true}
        />
      );
      const blob = await pdf(resumeDocument).toBlob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = getDownloadFileName(savedResume);
      link.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (error) {
      console.error("Failed to download resume", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      className={cx(
        "outline-theme-blue inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700",
        className
      )}
      onClick={onDownload}
      disabled={isDownloading}
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      {isDownloading ? "Preparing PDF..." : "Download"}
    </button>
  );
};
