import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
} from "components/Resume/ResumePDF/common";
import type { ResumeLayout } from "components/Resume/ResumePDF/layout";
import { styles } from "components/Resume/ResumePDF/styles";
import type { ResumeSkills } from "lib/redux/types";

export const ResumePDFSkills = ({
  heading,
  layout,
  skills,
  themeColor,
  showBulletPoints,
}: {
  heading: string;
  layout: ResumeLayout;
  skills: ResumeSkills;
  themeColor: string;
  showBulletPoints: boolean;
}) => {
  const { descriptions } = skills;

  return (
    <ResumePDFSection
      themeColor={themeColor}
      heading={heading}
      layout={layout}
    >
      <View style={{ ...styles.flexCol }}>
        <ResumePDFBulletList
          items={descriptions}
          layout={layout}
          showBulletPoints={showBulletPoints}
        />
      </View>
    </ResumePDFSection>
  );
};
