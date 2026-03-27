"use client";

import { pdf } from "@react-pdf/renderer";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AutoFitContext,
  type AutoFitContextValue,
} from "components/Resume/AutoFitContext";
import { ResumePDF } from "components/Resume/ResumePDF";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import {
  findBestFitScale,
  getAutoFitScaleBounds,
} from "components/Resume/auto-fit";
import { buildResumeLayout } from "components/Resume/ResumePDF/layout";
import { useAppSelector } from "lib/redux/hooks";
import { selectResume } from "lib/redux/resumeSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { getPdfPageCount } from "lib/get-pdf-page-count";

export const AutoFitProvider = ({ children }: { children: React.ReactNode }) => {
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);

  const manualLayout = useMemo(
    () => buildResumeLayout({ fontSize: settings.fontSize }),
    [settings.fontSize]
  );
  const [effectiveLayout, setEffectiveLayout] = useState(manualLayout);
  const [fitStatus, setFitStatus] = useState<AutoFitStatus>("disabled");
  const [isComputing, setIsComputing] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!settings.autoFitOnePage) {
      requestIdRef.current += 1;
      setEffectiveLayout(manualLayout);
      setFitStatus("disabled");
      setIsComputing(false);
    }
  }, [manualLayout, settings.autoFitOnePage]);

  useEffect(() => {
    if (!settings.autoFitOnePage) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsComputing(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const { minScale, maxScale } = getAutoFitScaleBounds(
          manualLayout.bodyFontSizePt
        );

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

        const { scale, fitStatus: nextFitStatus } = await findBestFitScale({
          minScale,
          maxScale,
          measurePageCount,
        });

        if (requestIdRef.current !== requestId) return;

        setEffectiveLayout(
          buildResumeLayout({
            fontSize: settings.fontSize,
            fitScale: scale,
            enforceAtsBoundaries: true,
          })
        );
        setFitStatus(nextFitStatus);
      } catch (error) {
        if (requestIdRef.current !== requestId) return;
        console.error("Failed to auto-fit resume to one page", error);
        setEffectiveLayout(manualLayout);
        setFitStatus("error");
      } finally {
        if (requestIdRef.current === requestId) {
          setIsComputing(false);
        }
      }
    }, 250);

    return () => {
      requestIdRef.current += 1;
      window.clearTimeout(timeoutId);
    };
  }, [manualLayout, resume, settings]);

  const value = useMemo(
    () => ({
      effectiveLayout,
      fitStatus,
      isComputing,
    }),
    [effectiveLayout, fitStatus, isComputing]
  );

  return (
    <AutoFitContext.Provider value={value}>{children}</AutoFitContext.Provider>
  );
};
