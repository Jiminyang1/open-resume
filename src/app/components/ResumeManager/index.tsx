"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  DocumentDuplicateIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { ResumeDropzoneProps } from "components/ResumeDropzone";
import type { ResumeManagerDownloadButtonProps } from "components/ResumeManager/ResumeManagerDownloadButton";
import {
  createNewResumeInLocalStorage,
  deleteResumeFromLocalStorage,
  duplicateResumeInLocalStorage,
  loadResumeManagerFromLocalStorage,
  openResumeInLocalStorage,
  type ResumeManagerState,
  type SavedResume,
} from "lib/redux/local-storage";

const ResumeDropzone = dynamic<ResumeDropzoneProps>(
  () =>
    import("components/ResumeDropzone").then((module) => module.ResumeDropzone),
  {
    ssr: false,
    loading: () => (
      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
        Loading PDF importer...
      </div>
    ),
  }
);

const ResumeManagerDownloadButton = dynamic<ResumeManagerDownloadButtonProps>(
  () =>
    import("components/ResumeManager/ResumeManagerDownloadButton").then(
      (module) => module.ResumeManagerDownloadButton
    ),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex h-10 items-center justify-center rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-400">
        Download
      </div>
    ),
  }
);

const defaultResumeManagerState: ResumeManagerState = {
  currentResumeId: null,
  resumes: [],
};

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getVisibleEntryCount = (entries: { visible?: boolean }[]) =>
  entries.filter((entry) => entry.visible !== false).length;

const getResumeStats = (savedResume: SavedResume) => ({
  workExperiences: getVisibleEntryCount(savedResume.resume.workExperiences),
  educations: getVisibleEntryCount(savedResume.resume.educations),
  projects: getVisibleEntryCount(savedResume.resume.projects),
  skills: savedResume.resume.skills.descriptions.filter(Boolean).length,
});

const sourceToLabel = {
  scratch: "Started here",
  imported: "Imported PDF",
} as const;

const resumeCardActionButtonClassName =
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold";

const resumeCardSecondaryActionButtonClassName =
  "outline-theme-blue inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-700";

const resumeCardDangerActionButtonClassName =
  "outline-theme-blue inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600";

export const ResumeManager = () => {
  const router = useRouter();
  const [resumeManagerState, setResumeManagerState] = useState(
    defaultResumeManagerState
  );

  const refreshResumeManager = () => {
    setResumeManagerState(loadResumeManagerFromLocalStorage());
  };

  useEffect(() => {
    setResumeManagerState(loadResumeManagerFromLocalStorage());
  }, []);

  const onCreateResume = () => {
    createNewResumeInLocalStorage();
    router.push("/resume-builder");
  };

  const onOpenResume = (resumeId: string) => {
    openResumeInLocalStorage(resumeId);
    router.push("/resume-builder");
  };

  const onDuplicateResume = (resumeId: string) => {
    duplicateResumeInLocalStorage(resumeId);
    router.push("/resume-builder");
  };

  const onDeleteResume = (savedResume: SavedResume) => {
    const shouldDelete = window.confirm(
      `Delete "${savedResume.title}" from your browser storage?`
    );
    if (!shouldDelete) return;

    deleteResumeFromLocalStorage(savedResume.id);
    refreshResumeManager();
  };

  return (
    <main className="min-h-[calc(100vh-var(--top-nav-bar-height))] bg-gray-50 px-6 py-10 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Resume Library
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 lg:text-4xl">
            Create, save, and reopen every version of your resume
          </h1>
          <p className="mt-4 text-base text-gray-600 lg:text-lg">
            Your resumes stay in this browser, and every edit in the builder
            keeps the current resume up to date automatically.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-full flex-col">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  New Resume
                </p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900 lg:text-2xl">
                  Start from scratch
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
                  Open a fresh resume in the builder. Once you make changes, it
                  is saved into your library automatically.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary mt-6 inline-flex items-center gap-2 self-start px-5 py-1.5 text-base lg:mt-auto"
                onClick={onCreateResume}
              >
                <PlusIcon className="h-4 w-4" />
                Create resume
              </button>
            </div>
          </section>

          <section className="h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Import PDF
            </p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900 lg:text-2xl">
              Turn an existing resume into a saved draft
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
              Importing creates a new resume in your library so your current
              drafts stay untouched.
            </p>
            <ResumeDropzone
              onFileUrlChange={() => undefined}
              className="mt-5 bg-white"
              compactView={true}
            />
          </section>
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Saved resumes
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {resumeManagerState.resumes.length === 0
                  ? "No resumes saved yet."
                  : `${resumeManagerState.resumes.length} resume${
                      resumeManagerState.resumes.length > 1 ? "s" : ""
                    } saved in this browser.`}
              </p>
            </div>
          </div>

          {resumeManagerState.resumes.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-14 text-center text-sm text-gray-500">
              Create a resume from scratch or import a PDF to start building
              your library.
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {resumeManagerState.resumes.map((savedResume) => {
                const stats = getResumeStats(savedResume);
                const isCurrent =
                  savedResume.id === resumeManagerState.currentResumeId;

                return (
                  <article
                    key={savedResume.id}
                    className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {savedResume.title}
                          </h3>
                          {isCurrent && (
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                              Current draft
                            </span>
                          )}
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {sourceToLabel[savedResume.source]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Last updated {formatDateTime(savedResume.updatedAt)}
                        </p>
                        <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            {stats.workExperiences} work experience
                            {stats.workExperiences === 1 ? "" : "s"}
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            {stats.educations} education
                            {stats.educations === 1 ? "" : "s"}
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            {stats.projects} project
                            {stats.projects === 1 ? "" : "s"}
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3">
                            {stats.skills} skill line
                            {stats.skills === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap lg:shrink-0">
                        <button
                          type="button"
                          className={`${resumeCardActionButtonClassName} bg-primary outline-theme-purple shadow-sm`}
                          onClick={() => onOpenResume(savedResume.id)}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Continue editing
                        </button>
                        <ResumeManagerDownloadButton savedResume={savedResume} />
                        <button
                          type="button"
                          className={resumeCardSecondaryActionButtonClassName}
                          onClick={() => onDuplicateResume(savedResume.id)}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className={resumeCardDangerActionButtonClassName}
                          onClick={() => onDeleteResume(savedResume)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};
