"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cx } from "lib/cx";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";

  return (
    <header
      aria-label="Site Header"
      className={cx(
        "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 px-3 lg:px-12",
        isHomePage && "bg-dot"
      )}
    >
      <div className="flex h-10 w-full items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-gray-900 lg:text-base">
              Open Resume Plus
            </div>
            <div className="hidden text-xs text-gray-500 sm:block">
              Built on OpenResume
            </div>
          </div>
        </Link>
        <nav
          aria-label="Site Nav Bar"
          className="flex items-center gap-2 text-sm font-medium"
        >
          {[
            ["/resumes", "Resumes"],
            ["/resume-builder", "Builder"],
            ["/resume-parser", "Parser"],
          ].map(([href, text]) => (
            <Link
              key={text}
              className="rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4"
              href={href}
            >
              {text}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

const LogoMark = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 40 47"
    className="h-9 w-9 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 7V13.06C28.78 14.03 34 19.85 34 26.9C34 28.69 33.65 30.4 33.04 31.97L38.24 35.04C39.35 32.55 40 29.81 40 26.9C40 16.53 32.11 8.01 22 7ZM20 40.9C12.27 40.9 6 34.63 6 26.9C6 19.85 11.22 14.03 18 13.06V7C7.88 8 0 16.53 0 26.9C0 37.95 8.94 46.9 19.99 46.9C26.61 46.9 32.46 43.67 36.1 38.72L30.91 35.66C28.35 38.85 24.42 40.9 20 40.9Z"
      fill="url(#open-resume-plus-logo-mark)"
    />
    <defs>
      <linearGradient
        id="open-resume-plus-logo-mark"
        x1="40"
        y1="7"
        x2="-7.20049"
        y2="19.3253"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4FC5EB" />
        <stop offset="1" stopColor="#5D52D9" />
      </linearGradient>
    </defs>
  </svg>
);
