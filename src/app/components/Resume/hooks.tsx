import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { getPxPerRem } from "lib/get-px-per-rem";
import { CSS_VARIABLES } from "globals-css";
import { getDefaultResumeScale } from "components/Resume/scale";

/**
 * useSetDefaultScale sets the default scale of the resume on load.
 *
 * It computes the scale by fitting the physical page within the available
 * preview height and width, so narrow layouts don't get clipped horizontally.
 */
export const useSetDefaultScale = ({
  setScale,
  documentSize,
  containerRef,
}: {
  setScale: (scale: number) => void;
  documentSize: string;
  containerRef?: RefObject<HTMLElement>;
}) => {
  const [scaleOnResize, setScaleOnResize] = useState(true);

  useEffect(() => {
    const getDefaultScale = () => {
      const container = containerRef?.current;

      if (container) {
        const computedStyle = window.getComputedStyle(container);
        const horizontalPaddingPx =
          parseFloat(computedStyle.paddingLeft) +
          parseFloat(computedStyle.paddingRight);
        const verticalPaddingPx =
          parseFloat(computedStyle.paddingTop) +
          parseFloat(computedStyle.paddingBottom);

        return getDefaultResumeScale({
          documentSize,
          availableHeightPx: container.clientHeight - verticalPaddingPx,
          availableWidthPx: container.clientWidth - horizontalPaddingPx,
        });
      }

      const screenHeightPx = window.innerHeight;
      const PX_PER_REM = getPxPerRem();
      const screenHeightRem = screenHeightPx / PX_PER_REM;
      const topNavBarHeightRem = parseFloat(
        CSS_VARIABLES["--top-nav-bar-height"]
      );
      const resumeControlBarHeight = parseFloat(
        CSS_VARIABLES["--resume-control-bar-height"]
      );
      const resumePadding = parseFloat(CSS_VARIABLES["--resume-padding"]);
      const topAndBottomResumePadding = resumePadding * 2 * PX_PER_REM;

      return getDefaultResumeScale({
        documentSize,
        availableHeightPx:
          screenHeightPx -
          (topNavBarHeightRem + resumeControlBarHeight) * PX_PER_REM -
          topAndBottomResumePadding,
        availableWidthPx: window.innerWidth,
      });
    };

    const setDefaultScale = () => {
      const defaultScale = getDefaultScale();
      setScale(defaultScale);
    };

    if (scaleOnResize) {
      setDefaultScale();
      window.addEventListener("resize", setDefaultScale);
    }

    return () => {
      window.removeEventListener("resize", setDefaultScale);
    };
  }, [containerRef, setScale, scaleOnResize, documentSize]);

  return { scaleOnResize, setScaleOnResize };
};
