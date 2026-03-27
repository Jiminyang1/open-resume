import { useAutoFitContext } from "components/Resume/AutoFitContext";
import {
  getBaseBodyFontSizePt,
  MAX_BODY_FONT_SIZE_PT,
} from "components/Resume/ResumePDF/layout";
import { BaseForm } from "components/ResumeForm/Form";
import { InputGroupWrapper } from "components/ResumeForm/Form/InputGroup";
import { THEME_COLORS } from "components/ResumeForm/ThemeForm/constants";
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

const formatFontSizePt = (value: number) => {
  const roundedValue = Math.round(value * 100) / 100;
  return Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(2).replace(/\.?0+$/, "");
};

const normalizeFontSizeInput = (value: string) => {
  if (value.trim() === "") return value;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return value;
  }

  return parsedValue > MAX_BODY_FONT_SIZE_PT
    ? String(MAX_BODY_FONT_SIZE_PT)
    : value;
};

export const ThemeForm = () => {
  const settings = useAppSelector(selectSettings);
  const { fontSize, fontFamily, documentSize, autoFitOnePage } = settings;
  const themeColor = settings.themeColor || DEFAULT_THEME_COLOR;
  const dispatch = useAppDispatch();
  const { effectiveLayout, fitStatus, isComputing } = useAutoFitContext();
  const baseFontSizePt = getBaseBodyFontSizePt(fontSize);
  const effectiveFontSizePt = effectiveLayout.bodyFontSizePt;
  const effectiveFontSizeDisplay = formatFontSizePt(effectiveFontSizePt);
  const baseFontSizeDisplay = formatFontSizePt(baseFontSizePt);
  const hasAdjustedFontSize =
    Math.abs(effectiveFontSizePt - baseFontSizePt) >= 0.05;
  const displayedFontSize = autoFitOnePage
    ? effectiveFontSizeDisplay
    : fontSize;
  const fontSizeLabel = autoFitOnePage
    ? "Applied Font Size (pt)"
    : "Font Size (pt)";

  const handleSettingsChange = (field: GeneralSetting, value: string) => {
    const normalizedValue =
      field === "fontSize" ? normalizeFontSizeInput(value) : value;
    dispatch(changeSettings({ field, value: normalizedValue }));
  };

  const handleAutoFitToggle = (checked: boolean) => {
    dispatch(changeAutoFitOnePage(checked));
  };

  const autoFitMessage = !autoFitOnePage
    ? null
    : isComputing
      ? "Calculating best one-page layout..."
      : fitStatus === "overflowAtLimit"
        ? "Content is too long to fit one page within ATS-safe limits."
        : fitStatus === "error"
          ? "Auto-fit is temporarily unavailable."
          : hasAdjustedFontSize
            ? `Auto-fit applied. Effective body font size: ${effectiveFontSizeDisplay}pt (base ${baseFontSizeDisplay}pt).`
            : `Auto-fit is on. The current base size of ${effectiveFontSizeDisplay}pt already fits on one page.`;

  const fontSizeHelperText = !autoFitOnePage
    ? null
    : isComputing
      ? `Base size is ${baseFontSizeDisplay}pt. Measuring the best one-page layout now.`
      : fitStatus === "overflowAtLimit"
        ? `Auto-fit reached the minimum readable size of ${effectiveFontSizeDisplay}pt and kept all content.`
        : fitStatus === "error"
          ? `Auto-fit could not calculate a fitted layout. The resume is using the base size of ${baseFontSizeDisplay}pt.`
          : hasAdjustedFontSize
            ? `Base size ${baseFontSizeDisplay}pt -> applied size ${effectiveFontSizeDisplay}pt.`
            : `Auto-fit kept the applied size at ${effectiveFontSizeDisplay}pt because the current layout already fits on one page.`;

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
          <InlineInput
            label="Theme Color"
            name="themeColor"
            value={settings.themeColor}
            placeholder={DEFAULT_THEME_COLOR}
            onChange={handleSettingsChange}
            inputStyle={{ color: themeColor }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_COLORS.map((color, idx) => (
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-sm text-white"
                style={{ backgroundColor: color }}
                key={idx}
                onClick={() => handleSettingsChange("themeColor", color)}
                onKeyDown={(e) => {
                  if (["Enter", " "].includes(e.key))
                    handleSettingsChange("themeColor", color);
                }}
                tabIndex={0}
              >
                {settings.themeColor === color ? "✓" : ""}
              </div>
            ))}
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
          {autoFitOnePage && (
            <p className="mt-2 text-sm text-gray-500">
              Base size preset: {baseFontSizeDisplay}pt. Auto-fit applies the
              actual size shown above to the PDF content.
            </p>
          )}
          <FontSizeSelections
            fontFamily={fontFamily as FontFamily}
            themeColor={themeColor}
            selectedFontSize={fontSize}
            handleSettingsChange={handleSettingsChange}
          />
          {fontSizeHelperText && (
            <p
              className={`mt-2 text-sm ${
                fitStatus === "overflowAtLimit" || fitStatus === "error"
                  ? "text-amber-700"
                  : "text-gray-500"
              }`}
            >
              {fontSizeHelperText}
            </p>
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
          {autoFitMessage && (
            <p
              className={`mt-2 text-sm ${
                fitStatus === "overflowAtLimit" || fitStatus === "error"
                  ? "text-amber-700"
                  : "text-gray-500"
              }`}
            >
              {autoFitMessage}
            </p>
          )}
        </div>
      </div>
    </BaseForm>
  );
};
