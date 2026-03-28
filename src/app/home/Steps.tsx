import Link from "next/link";

const WORKFLOWS = [
  {
    title: "Build",
    text: "Start with a blank resume, edit with live preview, and export a polished PDF.",
    href: "/resumes",
    cta: "Open Builder",
  },
  {
    title: "Import",
    text: "Pull in an existing resume PDF and keep iterating without rebuilding everything.",
    href: "/resume-import",
    cta: "Import Resume",
  },
  {
    title: "Parse",
    text: "See how clearly your resume can be read by the ATS-style parsing workflow.",
    href: "/resume-parser",
    cta: "Check Parser",
  },
];

export const Steps = () => {
  return (
    <section className="mx-auto mt-10 rounded-3xl border border-gray-200 bg-white/80 px-6 py-8 shadow-sm backdrop-blur lg:mt-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Three clear ways to start</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          Pick the workflow you need and get to editing quickly.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {WORKFLOWS.map(({ title, text, href, cta }) => (
            <article
              key={title}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5"
            >
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="mt-3 min-h-[84px] leading-7 text-gray-600">{text}</p>
              <Link
                href={href}
                className="mt-5 inline-flex items-center font-semibold text-sky-700 underline underline-offset-4"
              >
                {cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
