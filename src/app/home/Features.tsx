import Link from "next/link";

const FEATURES = [
  {
    title: "Built in the open",
    text: (
      <>
        Open Resume Plus stays open-source and explicitly acknowledges the{" "}
        <Link
          href="https://github.com/xitanggg/open-resume"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2"
        >
          OpenResume
        </Link>{" "}
        foundation it was built on.
      </>
    ),
  },
  {
    title: "Local-first workflow",
    text: "Resume data stays in the browser-first flow, which keeps iteration fast and reduces friction for users who just want to edit and export.",
  },
  {
    title: "Product-minded simplicity",
    text: "The homepage now focuses on the core paths only: build, import, and parse, without the extra marketing clutter from the original landing page.",
  },
  {
    title: "Ready to keep evolving",
    text: "This fork is positioned as an actively maintained product direction, so branding and copy can keep changing while the attribution remains clear.",
  },
];

export const Features = () => {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold">A smaller, clearer homepage</h2>
          <p className="mt-3 leading-7 text-gray-600">
            Open Resume Plus keeps the original spirit of utility and openness,
            while presenting the product in a more focused way.
          </p>
        </div>
        <dl className="mt-8 grid gap-4 lg:grid-cols-2">
          {FEATURES.map(({ title, text }) => (
            <div
              className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
              key={title}
            >
              <dt className="text-xl font-bold">{title}</dt>
              <dd className="mt-3 leading-7 text-gray-600">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
