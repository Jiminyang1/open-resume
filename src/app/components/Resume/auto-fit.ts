import { MIN_BODY_FONT_SIZE_PT } from "components/Resume/ResumePDF/layout";

export type AutoFitStatus =
  | "disabled"
  | "applied"
  | "overflowAtLimit"
  | "error";

const MIN_LAYOUT_SCALE = 0.75;
const BASE_LAYOUT_SCALE = 1;
const FIT_SCALE_PRECISION = 0.001;
const DEFAULT_MAX_ITERATIONS = 9;
const FINAL_SCALE_BACKOFF_STEP = 0.005;

const roundScale = (value: number) => Math.round(value * 1000) / 1000;

export const getAutoFitScaleBounds = (baseBodyFontSizePt: number) => ({
  minScale: roundScale(
    Math.min(BASE_LAYOUT_SCALE, MIN_BODY_FONT_SIZE_PT / baseBodyFontSizePt)
  ),
  maxScale: BASE_LAYOUT_SCALE,
});

export const findBestFitScale = async ({
  minScale,
  maxScale,
  measurePageCount,
  maxIterations = DEFAULT_MAX_ITERATIONS,
}: {
  minScale: number;
  maxScale: number;
  measurePageCount: (scale: number) => Promise<number>;
  maxIterations?: number;
}) => {
  const normalizedMinScale = Math.min(minScale, maxScale);
  const normalizedMaxScale = Math.max(minScale, maxScale);

  const maxScalePageCount = await measurePageCount(normalizedMaxScale);
  if (maxScalePageCount <= 1) {
    return {
      scale: normalizedMaxScale,
      fitStatus: "applied" as const,
    };
  }

  const minScalePageCount = await measurePageCount(normalizedMinScale);
  if (minScalePageCount > 1) {
    return {
      scale: normalizedMinScale,
      fitStatus: "overflowAtLimit" as const,
    };
  }

  let low = normalizedMinScale;
  let high = normalizedMaxScale;
  let bestScale = normalizedMinScale;

  for (let idx = 0; idx < maxIterations; idx++) {
    if (high - low <= FIT_SCALE_PRECISION) break;

    const mid = roundScale((low + high) / 2);
    const pageCount = await measurePageCount(mid);

    if (pageCount <= 1) {
      bestScale = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  let stabilizedScale = roundScale(bestScale);
  let stabilizedPageCount = await measurePageCount(stabilizedScale);

  while (
    stabilizedPageCount > 1 &&
    stabilizedScale > normalizedMinScale + FIT_SCALE_PRECISION
  ) {
    stabilizedScale = roundScale(
      Math.max(normalizedMinScale, stabilizedScale - FINAL_SCALE_BACKOFF_STEP)
    );
    stabilizedPageCount = await measurePageCount(stabilizedScale);
  }

  return {
    scale: stabilizedScale,
    fitStatus: stabilizedPageCount <= 1 ? ("applied" as const) : ("overflowAtLimit" as const),
  };
};
