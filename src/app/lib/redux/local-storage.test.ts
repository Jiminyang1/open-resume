import {
  createNewResumeInLocalStorage,
  deleteResumeFromLocalStorage,
  duplicateResumeInLocalStorage,
  loadResumeManagerFromLocalStorage,
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import type { RootState } from "lib/redux/store";

const initialResumeState = {
  profile: {
    name: "",
    summary: "",
    email: "",
    phone: "",
    location: "",
    url: "",
  },
  workExperiences: [
    {
      visible: true,
      company: "",
      jobTitle: "",
      date: "",
      descriptions: [],
    },
  ],
  educations: [
    {
      visible: true,
      school: "",
      degree: "",
      gpa: "",
      date: "",
      descriptions: [],
    },
  ],
  projects: [
    {
      visible: true,
      project: "",
      date: "",
      descriptions: [],
    },
  ],
  skills: {
    descriptions: [],
  },
  custom: {
    descriptions: [],
  },
};

const initialSettings = {
  themeColor: "#38bdf8",
  fontFamily: "Roboto",
  fontSize: "11",
  documentSize: "Letter",
  autoFitOnePage: false,
  formToShow: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: false,
  },
  formToHeading: {
    workExperiences: "WORK EXPERIENCE",
    educations: "EDUCATION",
    projects: "PROJECT",
    skills: "SKILLS",
    custom: "CUSTOM SECTION",
  },
  formsOrder: ["workExperiences", "educations", "projects", "skills", "custom"],
  showBulletPoints: {
    educations: true,
    projects: true,
    skills: true,
    custom: true,
  },
};

const createRootState = ({
  resume = initialResumeState,
  settings = initialSettings,
}: Partial<RootState> = {}) =>
  ({
    resume,
    settings,
  }) as RootState;

describe("local storage resume manager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("migrates a legacy current resume into the resume library", () => {
    localStorage.setItem(
      "open-resume-state",
      JSON.stringify(
        createRootState({
          resume: {
            ...initialResumeState,
            profile: {
              ...initialResumeState.profile,
              name: "Legacy Resume",
            },
          },
        })
      )
    );

    const resumeManagerState = loadResumeManagerFromLocalStorage();

    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.currentResumeId).toBe(
      resumeManagerState.resumes[0].id
    );
    expect(resumeManagerState.resumes[0].title).toBe("Legacy Resume");
    expect(
      JSON.parse(localStorage.getItem("open-resume-manager") || "{}")
    ).toMatchObject({
      currentResumeId: resumeManagerState.currentResumeId,
    });
  });

  it("creates a new resume and makes it the current draft", () => {
    const savedResume = createNewResumeInLocalStorage();

    const resumeManagerState = loadResumeManagerFromLocalStorage();
    const currentSnapshot = loadStateFromLocalStorage();

    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.currentResumeId).toBe(savedResume.id);
    expect(currentSnapshot).toEqual({
      resume: savedResume.resume,
      settings: savedResume.settings,
    });
    expect(savedResume.title).toBe("Untitled Resume");
  });

  it("syncs builder edits back into the currently selected saved resume", () => {
    createNewResumeInLocalStorage();

    saveStateToLocalStorage(
      createRootState({
        resume: {
          ...initialResumeState,
          profile: {
            ...initialResumeState.profile,
            name: "Jane Doe",
          },
        },
      })
    );

    const resumeManagerState = loadResumeManagerFromLocalStorage();

    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.resumes[0].title).toBe("Jane Doe");
    expect(resumeManagerState.resumes[0].resume.profile.name).toBe("Jane Doe");
  });

  it("duplicates resumes and falls back to the next draft after delete", () => {
    const originalResume = createNewResumeInLocalStorage();
    const duplicatedResume = duplicateResumeInLocalStorage(originalResume.id);

    expect(duplicatedResume).toBeDefined();

    let resumeManagerState = loadResumeManagerFromLocalStorage();
    expect(resumeManagerState.resumes).toHaveLength(2);
    expect(resumeManagerState.currentResumeId).toBe(duplicatedResume?.id);

    deleteResumeFromLocalStorage(duplicatedResume!.id);

    resumeManagerState = loadResumeManagerFromLocalStorage();
    expect(resumeManagerState.resumes).toHaveLength(1);
    expect(resumeManagerState.currentResumeId).toBe(originalResume.id);
    expect(loadStateFromLocalStorage()).toEqual({
      resume: originalResume.resume,
      settings: originalResume.settings,
    });
  });
});
