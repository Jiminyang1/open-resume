import { Page, View, Document } from "@react-pdf/renderer";
import {
  buildResumeLayout,
  toPt,
  type ResumeLayout,
} from "components/Resume/ResumePDF/layout";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import { ResumePDFProfile } from "components/Resume/ResumePDF/ResumePDFProfile";
import { ResumePDFWorkExperience } from "components/Resume/ResumePDF/ResumePDFWorkExperience";
import { ResumePDFEducation } from "components/Resume/ResumePDF/ResumePDFEducation";
import { ResumePDFProject } from "components/Resume/ResumePDF/ResumePDFProject";
import { ResumePDFSkills } from "components/Resume/ResumePDF/ResumePDFSkills";
import { ResumePDFCustom } from "components/Resume/ResumePDF/ResumePDFCustom";
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_THEME_COLOR,
} from "lib/redux/settingsSlice";
import type { Settings, ShowForm } from "lib/redux/settingsSlice";
import {
  getVisibleResumeEntries,
  hasVisibleResumeEntries,
} from "lib/redux/resume-visibility";
import type { Resume } from "lib/redux/types";
import { SuppressResumePDFErrorMessage } from "components/Resume/ResumePDF/common/SuppressResumePDFErrorMessage";

/**
 * Note: ResumePDF is supposed to be rendered inside PDFViewer. However,
 * PDFViewer is rendered too slow and has noticeable delay as you enter
 * the resume form, so we render it without PDFViewer to make it render
 * instantly. There are 2 drawbacks with this approach:
 * 1. Not everything works out of box if not rendered inside PDFViewer,
 *    e.g. svg doesn't work, so it takes in a isPDF flag that maps react
 *    pdf element to the correct dom element.
 * 2. It throws a lot of errors in console log, e.g. "<VIEW /> is using incorrect
 *    casing. Use PascalCase for React components, or lowercase for HTML elements."
 *    in development, causing a lot of noises. We can possibly workaround this by
 *    mapping every react pdf element to a dom element, but for now, we simply
 *    suppress these messages in <SuppressResumePDFErrorMessage />.
 *    https://github.com/diegomura/react-pdf/issues/239#issuecomment-487255027
 */
export const ResumePDF = ({
  resume,
  settings,
  layout,
  isPDF = false,
}: {
  resume: Resume;
  settings: Settings;
  layout?: ResumeLayout;
  isPDF?: boolean;
}) => {
  const { profile, workExperiences, educations, projects, skills, custom } =
    resume;
  const { name } = profile;
  const {
    fontFamily,
    fontSize,
    documentSize,
    formToHeading,
    formToShow,
    formsOrder,
    showBulletPoints,
  } = settings;
  const themeColor = settings.themeColor || DEFAULT_THEME_COLOR;
  const accentColor = settings.themeColorTargets?.banner
    ? themeColor
    : DEFAULT_FONT_COLOR;
  const nameColor = settings.themeColorTargets?.name ? themeColor : undefined;
  const headingColor = settings.themeColorTargets?.sectionHeadings
    ? themeColor
    : undefined;
  const resolvedLayout = layout ?? buildResumeLayout({ fontSize });
  const visibleWorkExperiences = getVisibleResumeEntries(workExperiences);
  const visibleEducations = getVisibleResumeEntries(educations);
  const visibleProjects = getVisibleResumeEntries(projects);

  const showFormsOrder = formsOrder.filter((form) => {
    if (!formToShow[form]) return false;

    switch (form) {
      case "workExperiences":
        return hasVisibleResumeEntries(workExperiences);
      case "educations":
        return hasVisibleResumeEntries(educations);
      case "projects":
        return hasVisibleResumeEntries(projects);
      default:
        return true;
    }
  });

  const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
    workExperiences: () => (
      <ResumePDFWorkExperience
        heading={formToHeading["workExperiences"]}
        headingColor={headingColor}
        layout={resolvedLayout}
        workExperiences={visibleWorkExperiences}
        themeColor={accentColor}
      />
    ),
    educations: () => (
      <ResumePDFEducation
        heading={formToHeading["educations"]}
        educations={visibleEducations}
        headingColor={headingColor}
        layout={resolvedLayout}
        themeColor={accentColor}
        showBulletPoints={showBulletPoints["educations"]}
      />
    ),
    projects: () => (
      <ResumePDFProject
        heading={formToHeading["projects"]}
        headingColor={headingColor}
        layout={resolvedLayout}
        projects={visibleProjects}
        themeColor={accentColor}
      />
    ),
    skills: () => (
      <ResumePDFSkills
        heading={formToHeading["skills"]}
        headingColor={headingColor}
        layout={resolvedLayout}
        skills={skills}
        themeColor={accentColor}
        showBulletPoints={showBulletPoints["skills"]}
      />
    ),
    custom: () => (
      <ResumePDFCustom
        heading={formToHeading["custom"]}
        custom={custom}
        headingColor={headingColor}
        layout={resolvedLayout}
        themeColor={accentColor}
        showBulletPoints={showBulletPoints["custom"]}
      />
    ),
  };

  return (
    <>
      <Document title={`${name} Resume`} author={name} producer={"OpenResume"}>
        <Page
          size={documentSize === "A4" ? "A4" : "LETTER"}
          style={{
            ...styles.flexCol,
            color: DEFAULT_FONT_COLOR,
            fontFamily,
            fontSize: toPt(resolvedLayout.bodyFontSizePt),
          }}
        >
          {Boolean(accentColor) && (
            <View
              style={{
                width: spacing["full"],
                height: toPt(resolvedLayout.topAccentHeightPt),
                backgroundColor: accentColor,
              }}
            />
          )}
          <View
            style={{
              ...styles.flexCol,
              padding: `${toPt(resolvedLayout.pagePaddingTopPt)} ${toPt(
                resolvedLayout.pagePaddingXPt
              )} ${toPt(
                resolvedLayout.pagePaddingBottomPt +
                  resolvedLayout.autoFitBottomReservePt
              )}`,
            }}
          >
            <ResumePDFProfile
              layout={resolvedLayout}
              profile={profile}
              nameColor={nameColor}
              isPDF={isPDF}
            />
            {showFormsOrder.map((form) => {
              const Component = formTypeToComponent[form];
              return <Component key={form} />;
            })}
          </View>
        </Page>
      </Document>
      <SuppressResumePDFErrorMessage />
    </>
  );
};
