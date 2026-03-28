import { deepClone } from "lib/deep-clone";
import type { Settings } from "lib/redux/settingsSlice";
import type { RootState } from "lib/redux/store";
import type { Resume } from "lib/redux/types";

const CURRENT_RESUME_STORAGE_KEY = "open-resume-state";
const RESUME_MANAGER_STORAGE_KEY = "open-resume-manager";
const UNTITLED_RESUME_TITLE = "Untitled Resume";

export type StoredResumeSnapshot = Pick<RootState, "resume" | "settings">;
export type StoredResumeSource = "scratch" | "imported";

export interface SavedResume {
  id: string;
  title: string;
  source: StoredResumeSource;
  createdAt: string;
  updatedAt: string;
  resume: Resume;
  settings: Settings;
}

export interface ResumeManagerState {
  currentResumeId: string | null;
  resumes: SavedResume[];
}

const createDefaultResume = (): Resume => ({
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
});

const createDefaultSettings = (): Settings => ({
  themeColor: "#171717",
  themeColorTargets: {
    banner: false,
    name: false,
    sectionHeadings: false,
  },
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
});

const readFromLocalStorage = <T>(key: string) => {
  if (typeof window === "undefined") return undefined;

  try {
    const stringifiedState = localStorage.getItem(key);
    if (!stringifiedState) return undefined;
    return JSON.parse(stringifiedState) as T;
  } catch {
    return undefined;
  }
};

const writeToLocalStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;

  try {
    const stringifiedState = JSON.stringify(value);
    localStorage.setItem(key, stringifiedState);
  } catch {
    // Ignore
  }
};

const removeFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};

const getResumeTitle = ({
  resume,
  fallbackTitle,
}: {
  resume: Resume;
  fallbackTitle?: string;
}) => {
  const profileName = resume.profile.name.trim();
  return profileName || fallbackTitle?.trim() || UNTITLED_RESUME_TITLE;
};

const getDuplicateResumeTitle = (title: string) => {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return `${UNTITLED_RESUME_TITLE} Copy`;
  return trimmedTitle.endsWith("Copy")
    ? `${trimmedTitle} 2`
    : `${trimmedTitle} Copy`;
};

const createResumeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `resume-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createStoredResume = ({
  resume,
  settings,
  source,
  title,
}: {
  resume: Resume;
  settings: Settings;
  source: StoredResumeSource;
  title?: string;
}): SavedResume => {
  const now = new Date().toISOString();

  return {
    id: createResumeId(),
    title: getResumeTitle({ resume, fallbackTitle: title }),
    source,
    createdAt: now,
    updatedAt: now,
    resume: deepClone(resume),
    settings: deepClone(settings),
  };
};

const loadCurrentResumeSnapshot = () =>
  readFromLocalStorage<StoredResumeSnapshot>(CURRENT_RESUME_STORAGE_KEY);

const saveCurrentResumeSnapshot = (snapshot: StoredResumeSnapshot) => {
  writeToLocalStorage(CURRENT_RESUME_STORAGE_KEY, snapshot);
};

const normalizeResumeManagerState = (
  resumeManagerState?: ResumeManagerState
): ResumeManagerState | undefined => {
  if (!resumeManagerState || !Array.isArray(resumeManagerState.resumes)) {
    return undefined;
  }

  const resumes = resumeManagerState.resumes;
  const currentResumeId = resumes.some(
    (resume) => resume.id === resumeManagerState.currentResumeId
  )
    ? resumeManagerState.currentResumeId
    : resumes[0]?.id ?? null;

  return {
    currentResumeId,
    resumes,
  };
};

const saveResumeManagerState = (resumeManagerState: ResumeManagerState) => {
  writeToLocalStorage(RESUME_MANAGER_STORAGE_KEY, resumeManagerState);
};

const loadStoredResumeManagerState = () =>
  normalizeResumeManagerState(
    readFromLocalStorage<ResumeManagerState>(RESUME_MANAGER_STORAGE_KEY)
  );

const saveResumeToManager = (snapshot: StoredResumeSnapshot) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const currentResumeId = resumeManagerState.currentResumeId;

  if (!currentResumeId) {
    const savedResume = createStoredResume({
      ...snapshot,
      source: "scratch",
    });
    saveResumeManagerState({
      currentResumeId: savedResume.id,
      resumes: [savedResume, ...resumeManagerState.resumes],
    });
    return;
  }

  let hasFoundCurrentResume = false;
  const resumes = resumeManagerState.resumes.map((savedResume) => {
    if (savedResume.id !== currentResumeId) return savedResume;

    hasFoundCurrentResume = true;
    return {
      ...savedResume,
      title: getResumeTitle({
        resume: snapshot.resume,
        fallbackTitle: savedResume.title,
      }),
      updatedAt: new Date().toISOString(),
      resume: deepClone(snapshot.resume),
      settings: deepClone(snapshot.settings),
    };
  });

  if (!hasFoundCurrentResume) {
    const savedResume = createStoredResume({
      ...snapshot,
      source: "scratch",
    });
    saveResumeManagerState({
      currentResumeId: savedResume.id,
      resumes: [savedResume, ...resumes],
    });
    return;
  }

  saveResumeManagerState({
    currentResumeId,
    resumes,
  });
};

export const loadStateFromLocalStorage = () => {
  const currentSnapshot = loadCurrentResumeSnapshot();
  if (currentSnapshot) return currentSnapshot;

  const resumeManagerState = loadStoredResumeManagerState();
  if (!resumeManagerState?.currentResumeId) return undefined;

  const currentResume = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeManagerState.currentResumeId
  );
  if (!currentResume) return undefined;

  return {
    resume: currentResume.resume,
    settings: currentResume.settings,
  };
};

export const saveStateToLocalStorage = (state: RootState) => {
  const snapshot = {
    resume: deepClone(state.resume),
    settings: deepClone(state.settings),
  };

  saveCurrentResumeSnapshot(snapshot);
  saveResumeToManager(snapshot);
};

export const loadResumeManagerFromLocalStorage = (): ResumeManagerState => {
  const storedResumeManagerState = loadStoredResumeManagerState();
  if (storedResumeManagerState) {
    return storedResumeManagerState;
  }

  const currentSnapshot = loadCurrentResumeSnapshot();
  if (!currentSnapshot) {
    return {
      currentResumeId: null,
      resumes: [],
    };
  }

  const migratedResume = createStoredResume({
    ...currentSnapshot,
    source: "scratch",
  });
  const migratedResumeManagerState = {
    currentResumeId: migratedResume.id,
    resumes: [migratedResume],
  };

  saveResumeManagerState(migratedResumeManagerState);

  return migratedResumeManagerState;
};

export const createNewResumeInLocalStorage = () => {
  const savedResume = createStoredResume({
    resume: createDefaultResume(),
    settings: createDefaultSettings(),
    source: "scratch",
  });
  const resumeManagerState = loadResumeManagerFromLocalStorage();

  saveResumeManagerState({
    currentResumeId: savedResume.id,
    resumes: [savedResume, ...resumeManagerState.resumes],
  });
  saveCurrentResumeSnapshot({
    resume: savedResume.resume,
    settings: savedResume.settings,
  });

  return savedResume;
};

export const createImportedResumeInLocalStorage = ({
  resume,
  settings,
  title,
}: {
  resume: Resume;
  settings: Settings;
  title?: string;
}) => {
  const savedResume = createStoredResume({
    resume,
    settings,
    source: "imported",
    title,
  });
  const resumeManagerState = loadResumeManagerFromLocalStorage();

  saveResumeManagerState({
    currentResumeId: savedResume.id,
    resumes: [savedResume, ...resumeManagerState.resumes],
  });
  saveCurrentResumeSnapshot({
    resume: savedResume.resume,
    settings: savedResume.settings,
  });

  return savedResume;
};

export const openResumeInLocalStorage = (resumeId: string) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const savedResume = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeId
  );
  if (!savedResume) return undefined;

  saveResumeManagerState({
    ...resumeManagerState,
    currentResumeId: resumeId,
  });
  saveCurrentResumeSnapshot({
    resume: savedResume.resume,
    settings: savedResume.settings,
  });

  return savedResume;
};

export const duplicateResumeInLocalStorage = (resumeId: string) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const savedResume = resumeManagerState.resumes.find(
    (resume) => resume.id === resumeId
  );
  if (!savedResume) return undefined;

  const duplicatedResume = createStoredResume({
    resume: savedResume.resume,
    settings: savedResume.settings,
    source: savedResume.source,
    title: getDuplicateResumeTitle(savedResume.title),
  });

  saveResumeManagerState({
    currentResumeId: duplicatedResume.id,
    resumes: [duplicatedResume, ...resumeManagerState.resumes],
  });
  saveCurrentResumeSnapshot({
    resume: duplicatedResume.resume,
    settings: duplicatedResume.settings,
  });

  return duplicatedResume;
};

export const deleteResumeFromLocalStorage = (resumeId: string) => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  const resumes = resumeManagerState.resumes.filter(
    (resume) => resume.id !== resumeId
  );
  const nextCurrentResumeId =
    resumeManagerState.currentResumeId === resumeId
      ? resumes[0]?.id ?? null
      : resumeManagerState.currentResumeId;

  saveResumeManagerState({
    currentResumeId: nextCurrentResumeId,
    resumes,
  });

  if (!nextCurrentResumeId) {
    removeFromLocalStorage(CURRENT_RESUME_STORAGE_KEY);
    return;
  }

  const currentResume = resumes.find(
    (resume) => resume.id === nextCurrentResumeId
  );
  if (!currentResume) return;

  saveCurrentResumeSnapshot({
    resume: currentResume.resume,
    settings: currentResume.settings,
  });
};

export const getHasUsedAppBefore = () => {
  const resumeManagerState = loadResumeManagerFromLocalStorage();
  return (
    resumeManagerState.resumes.length > 0 ||
    Boolean(loadCurrentResumeSnapshot())
  );
};
