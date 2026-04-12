"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppNavbarProps = {
  onThemeToggle: () => void;
};

const navItems = [
  { href: "/", label: "Финансы" },
  { href: "/keeping-prr", label: "Остатки и обороты" },
];

export const AppNavbar = ({ onThemeToggle }: AppNavbarProps) => {
  const pathname = usePathname();

  return (
    <nav className="pdf-export-control flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold shadow-sm transition ${
                isActive
                  ? "border-sky-200/80 bg-sky-100/90 text-sky-700 dark:border-sky-700/80 dark:bg-sky-900/40 dark:text-sky-300"
                  : "border-zinc-200/70 bg-white/85 text-zinc-700 hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onThemeToggle}
        className="ml-auto inline-flex h-10 w-[246px] items-center justify-center gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
        aria-label="Переключить тему"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 dark:hidden dtm:hidden">
          <path
            d="M10 1.5a.75.75 0 0 1 .75.75V4a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 10 1.5Zm0 14a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8.5-4a.75.75 0 0 1-.75.75H16a.75.75 0 0 1 0-1.5h1.75a.75.75 0 0 1 .75.75ZM4 11.25a.75.75 0 0 1-.75.75H1.5a.75.75 0 0 1 0-1.5h1.75a.75.75 0 0 1 .75.75Zm11.364 5.114a.75.75 0 0 1-1.06 0l-1.237-1.237a.75.75 0 1 1 1.06-1.06l1.237 1.236a.75.75 0 0 1 0 1.061ZM6.933 7.933a.75.75 0 0 1-1.06 0L4.636 6.696a.75.75 0 1 1 1.06-1.06l1.237 1.236a.75.75 0 0 1 0 1.061Zm8.431 0a.75.75 0 0 1 0-1.06l1.237-1.237a.75.75 0 1 1 1.06 1.06l-1.236 1.237a.75.75 0 0 1-1.061 0ZM6.933 14.067a.75.75 0 0 1 0 1.06l-1.237 1.237a.75.75 0 1 1-1.06-1.06l1.236-1.237a.75.75 0 0 1 1.061 0Z"
            fill="currentColor"
          />
        </svg>
        <svg aria-hidden viewBox="0 0 20 20" className="hidden h-4 w-4 dark:block dtm:hidden">
          <path
            d="M12.2 3.2a.75.75 0 0 1 .43 1 6.25 6.25 0 1 0 3.17 7.95.75.75 0 1 1 1.4.53A7.75 7.75 0 1 1 12.2 3.2Z"
            fill="currentColor"
          />
        </svg>
        <svg aria-hidden viewBox="0 0 20 20" className="hidden h-4 w-4 dtm:block">
          <path
            d="M2.75 17.25V7.3L10 2.75L17.25 7.3V17.25H2.75ZM4.25 15.75H15.75V8.12L10 4.5L4.25 8.12V15.75Z"
            fill="currentColor"
          />
          <path d="M6 13H9V15H6V13ZM6 10H9V12H6V10ZM10.5 12H14V15H10.5V12Z" fill="currentColor" />
        </svg>
        <span className="dark:hidden dtm:hidden">Светлая</span>
        <span className="hidden dark:inline dtm:hidden">Темная</span>
        <span className="hidden dtm:inline">DTM</span>
      </button>
    </nav>
  );
};
