import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import { toPt, type ResumeLayout } from "components/Resume/ResumePDF/layout";
import { styles } from "components/Resume/ResumePDF/styles";
import type { ResumeProject } from "lib/redux/types";

export const ResumePDFProject = ({
  heading,
  layout,
  projects,
  themeColor,
}: {
  heading: string;
  layout: ResumeLayout;
  projects: ResumeProject[];
  themeColor: string;
}) => {
  return (
    <ResumePDFSection
      themeColor={themeColor}
      heading={heading}
      layout={layout}
    >
      {projects.map(({ project, date, descriptions }, idx) => (
        <View key={idx}>
          <View
            style={{
              ...styles.flexRowBetween,
              marginTop: toPt(layout.compactGapPt),
            }}
          >
            <ResumePDFText bold={true}>{project}</ResumePDFText>
            <ResumePDFText>{date}</ResumePDFText>
          </View>
          <View style={{ ...styles.flexCol, marginTop: toPt(layout.compactGapPt) }}>
            <ResumePDFBulletList items={descriptions} layout={layout} />
          </View>
        </View>
      ))}
    </ResumePDFSection>
  );
};
