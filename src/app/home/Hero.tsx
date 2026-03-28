import Link from "next/link";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { AutoTypingResume } from "home/AutoTypingResume";

export const Hero = () => {
  return (
    <section className="lg:flex lg:h-[825px] lg:justify-center">
      <FlexboxSpacer maxWidth={75} minWidth={0} className="hidden lg:block" />
      <div className="mx-auto max-w-xl pt-8 text-center lg:mx-0 lg:grow lg:pt-32 lg:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gray-500">
          Open-source continuation
        </p>
        <h1 className="text-primary pb-2 pt-3 text-4xl font-bold lg:text-5xl">
          Open Resume Plus
        </h1>
        <p className="mt-3 text-lg leading-8 lg:mt-5 lg:text-xl">
          A more focused resume builder and parser, evolved from OpenResume and
          refined into a cleaner product experience.
        </p>
        <p className="mt-4 text-sm leading-7 text-gray-600 lg:max-w-lg">
          Build from scratch, import an existing resume, or test ATS readability
          without adding clutter to the workflow.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:mt-10 lg:items-start">
          <Link href="/resumes" className="btn-primary">
            Open Resume Library <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/resume-parser"
            className="outline-theme-blue inline-block rounded-full border border-sky-200 px-6 py-2 font-semibold text-sky-700"
          >
            Try Resume Parser
          </Link>
        </div>
        <p className="mt-5 text-sm leading-7 text-gray-600 lg:max-w-lg">
          Built with respect for the original{" "}
          <Link
            href="https://github.com/xitanggg/open-resume"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2"
          >
            OpenResume
          </Link>{" "}
          project and continued as an independent open-source product.
        </p>
      </div>
      <FlexboxSpacer maxWidth={100} minWidth={50} className="hidden lg:block" />
      <div className="mt-6 flex justify-center lg:mt-4 lg:block lg:grow">
        <AutoTypingResume />
      </div>
    </section>
  );
};
