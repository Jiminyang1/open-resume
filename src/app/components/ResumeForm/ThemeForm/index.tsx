import { useEffect, useState } from "react";
import { useAutoFitContext } from "components/Resume/AutoFitContext";
import {
  getBaseBodyFontSizePt,
  MIN_BODY_FONT_SIZE_PT,
  MAX_BODY_FONT_SIZE_PT,
  MAX_MANUAL_BODY_FONT_SIZE_PT,
} from "components/Resume/ResumePDF/layout";
import { BaseForm } from "components/ResumeForm/Form";
import { InputGroupWrapper } from "components/ResumeForm/Form/InputGroup";
import { InlineInput } from "components/ResumeForm/ThemeForm/InlineInput";
import {
  DocumentSizeSelections,
  FontFamilySelectionsCSR,
  FontSizeSelections,
} from "components/ResumeForm/ThemeForm/Selection";
import {
  changeAutoFitOnePage,
  changeSettings,
  DEFAULT_THEME_COLOR,
  selectSettings,
  type GeneralSetting,
} from "lib/redux/settingsSlice";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import type { FontFamily } from "components/fonts/constants";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6})$/;

const formatFontSizePt = (value: number) => {
  const roundedValue = Math.round(value * 100) / 100;
  return Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(2).replace(/\.?0+$/, "");
};

const normalizeThemeColor = (value?: string) => {
  if (!value) return DEFAULT_THEME_COLOR;
  return HEX_COLOR_PATTERN.test(value) ? value : DEFAULT_THEME_COLOR;
};

const RECOMMENDED_ATS_FONT_SIZE_RANGE_LABEL = `${formatFontSizePt(
  MIN_BODY_FONT_SIZE_PT
)}-${formatFontSizePt(MAX_BODY_FONT_SIZE_PT)}pt`;

const normalizeFontSizeInput = (value: string) => {
  if (value.trim() === "") return value;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return value;
  }

  return parsedValue > MAX_MANUAL_BODY_FONT_SIZE_PT
    ? String(MAX_MANUAL_BODY_FONT_SIZE_PT)
    : value;
};

export const ThemeForm = () => {
  const settings = useAppSelector(selectSettings);
  const { fontSize, fontFamily, documentSize, autoFitOnePage } = settings;
  const themeColor = normalizeThemeColor(settings.themeColor);
  const [themeColorDraft, setThemeColorDraft] = useState(themeColor);
  const dispatch = useAppDispatch();
  const { effectiveLayout, fitStatus, isComputing } = useAutoFitContext();
  const parsedFontSize = Number(fontSize);
  const chosenFontSizePt = getBaseBodyFontSizePt(fontSize, {
    maxBodyFontSizePt: MAX_MANUAL_BODY_FONT_SIZE_PT,
  });
  const chosenFontSizeDisplay = formatFontSizePt(chosenFontSizePt);
  const effectiveFontSizePt = effectiveLayout.bodyFontSizePt;
  const effectiveFontSizeDisplay = formatFontSizePt(effectiveFontSizePt);
  const hasAdjustedFontSize =
    Math.abs(effectiveFontSizePt - chosenFontSizePt) >= 0.05;
  const displayedFontSize = autoFitOnePage
    ? effectiveFontSizeDisplay
    : fontSize;
  const fontSizeLabel = autoFitOnePage
    ? "Applied Font Size (pt)"
    : "Font Size (pt)";
  const atsReferenceFontSizePt = autoFitOnePage
    ? effectiveFontSizePt
    : chosenFontSizePt;
  const atsReferenceFontSizeDisplay = formatFontSizePt(atsReferenceFontSizePt);
  const isOutsideRecommendedAtsRange =
    atsReferenceFontSizePt < MIN_BODY_FONT_SIZE_PT ||
    atsReferenceFontSizePt > MAX_BODY_FONT_SIZE_PT;

  useEffect(() => {
    if (
      Number.isFinite(parsedFontSize) &&
      parsedFontSize > MAX_MANUAL_BODY_FONT_SIZE_PT
    ) {
      dispatch(
        changeSettings({
          field: "fontSize",
          value: chosenFontSizeDisplay,
        })
      );
    }
  }, [chosenFontSizeDisplay, dispatch, parsedFontSize]);

  useEffect(() => {
    setThemeColorDraft(themeColor);
  }, [themeColor]);

  const handleSettingsChange = (field: GeneralSetting, value: string) => {
    const normalizedValue =
      field === "fontSize" ? normalizeFontSizeInput(value) : value;
    dispatch(changeSettings({ field, value: normalizedValue }));
  };

  const handleThemeColorChange = (value: string) => {
    dispatch(
      changeSettings({
        field: "themeColor",
        value: normalizeThemeColor(value).toLowerCase(),
      })
    );
  };

  const handleThemeColorDraftCommit = () => {
    if (HEX_COLOR_PATTERN.test(themeColorDraft)) {
      handleThemeColorChange(themeColorDraft);
    } else {
      setThemeColorDraft(themeColor);
    }
  };

  const handleAutoFitToggle = (checked: boolean) => {
    dispatch(changeAutoFitOnePage(checked));
  };

  const autoFitStatusText = !autoFitOnePage
    ? null
    : isComputing
      ? "Finding the largest font size that still fits on one page..."
      : fitStatus === "overflowAtLimit"
        ? `Even at ${effectiveFontSizeDisplay}pt, the resume is still longer than one page. Shorten the content to keep it to one page.`
        : fitStatus === "error"
          ? `Auto-fit could not measure the PDF. Using your chosen size of ${chosenFontSizeDisplay}pt.`
          : hasAdjustedFontSize
            ? `One-page fit found at ${effectiveFontSizeDisplay}pt.`
            : `Already fits on one page at ${effectiveFontSizeDisplay}pt.`;

  const atsFontSizeWarning = isOutsideRecommendedAtsRange
    ? atsReferenceFontSizePt < MIN_BODY_FONT_SIZE_PT
      ? `Warning: The fitted size is ${atsReferenceFontSizeDisplay}pt, below the recommended ATS range of ${RECOMMENDED_ATS_FONT_SIZE_RANGE_LABEL}.`
      : `Warning: ${atsReferenceFontSizeDisplay}pt is above the recommended ATS range of ${RECOMMENDED_ATS_FONT_SIZE_RANGE_LABEL}.`
    : null;

  return (
    <BaseForm>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold tracking-wide text-gray-900 ">
            Resume Setting
          </h1>
        </div>
        <div>
          <InputGroupWrapper label="Theme Color" />
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
            <label className="relative block h-[50px] w-[50px] shrink-0 cursor-pointer">
              <span
                className="absolute inset-0 rounded-full border-[3px] border-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] ring-1 ring-gray-200"
                style={{ backgroundColor: themeColor }}
              />
              <input
                type="color"
                aria-label="Choose theme color"
                value={themeColor}
                onChange={(e) => handleThemeColorChange(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                Accent Color
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  inputMode="text"
                  aria-label="Theme color hex"
                  value={themeColorDraft.toUpperCase()}
                  onChange={(e) => setThemeColorDraft(e.target.value)}
                  onBlur={handleThemeColorDraftCommit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleThemeColorDraftCommit();
                    }
                    if (e.key === "Escape") {
                      setThemeColorDraft(themeColor);
                    }
                  }}
                  className="w-28 rounded-full bg-white px-3 py-1 text-sm font-semibold tracking-wide text-gray-700 ring-1 ring-gray-200 outline-none transition focus:ring-2 focus:ring-gray-300"
                />
                <button
                  type="button"
                  className="text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50"
                  onClick={() => handleThemeColorChange(DEFAULT_THEME_COLOR)}
                  disabled={themeColor === DEFAULT_THEME_COLOR}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <InputGroupWrapper label="Font Family" />
          <FontFamilySelectionsCSR
            selectedFontFamily={fontFamily}
            themeColor={themeColor}
            handleSettingsChange={handleSettingsChange}
          />
        </div>
        <div>
          <InlineInput
            label={fontSizeLabel}
            name="fontSize"
            value={displayedFontSize}
            placeholder="11"
            readOnly={autoFitOnePage}
            onChange={handleSettingsChange}
          />
          <FontSizeSelections
            fontFamily={fontFamily as FontFamily}
            themeColor={themeColor}
            selectedFontSize={fontSize}
            handleSettingsChange={handleSettingsChange}
          />
          {atsFontSizeWarning && (
            <p className="mt-2 text-sm text-amber-700">{atsFontSizeWarning}</p>
          )}
        </div>
        <div>
          <InputGroupWrapper label="Document Size" />
          <DocumentSizeSelections
            themeColor={themeColor}
            selectedDocumentSize={documentSize}
            handleSettingsChange={handleSettingsChange}
          />
        </div>
        <div>
          <InputGroupWrapper label="Auto Fit" />
          <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-md border border-gray-300 px-3 py-2 text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={autoFitOnePage}
              onChange={(e) => handleAutoFitToggle(e.target.checked)}
            />
            <span className="font-medium">Auto fit to 1 page</span>
          </label>
          {autoFitStatusText && (
            <p
              className={`mt-2 text-sm ${
                fitStatus === "overflowAtLimit" || fitStatus === "error"
                  ? "text-amber-700"
                  : "text-gray-500"
              }`}
            >
              {autoFitStatusText}
            </p>
          )}
        </div>
      </div>
    </BaseForm>
  );
};
