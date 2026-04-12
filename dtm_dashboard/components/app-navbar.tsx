"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppNavbarProps = {
  onThemeToggle: () => void;
};

const navItems = [
  { href: "/", label: "Финансы" },
  { href: "/keeping-prr", label: "Остатки и обороты" },
];

const navLinkClass = (isActive: boolean): string =>
  `inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold shadow-sm transition ${
    isActive
      ? "border-sky-200/80 bg-sky-100/90 text-sky-700 dark:border-sky-700/80 dark:bg-sky-900/40 dark:text-sky-300"
      : "border-zinc-200/70 bg-white/85 text-zinc-700 hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
  }`;

const ThemeToggleButton = ({ onThemeToggle, compact }: { onThemeToggle: () => void; compact?: boolean }) => {
  return (
    <button
      type="button"
      onClick={onThemeToggle}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900 ${
        compact ? "w-10 px-0" : "w-[246px]"
      }`}
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
      {compact ? null : <span className="dark:hidden dtm:hidden">Светлая</span>}
      {compact ? null : <span className="hidden dark:inline dtm:hidden">Темная</span>}
      {compact ? null : <span className="hidden dtm:inline">DTM</span>}
    </button>
  );
};

export const AppNavbar = ({ onThemeToggle }: AppNavbarProps) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const swipeStateRef = useRef<{
    tracking: boolean;
    mode: "open" | "close" | null;
    startX: number;
    startY: number;
    lastX: number;
  }>({
    tracking: false,
    mode: null,
    startX: 0,
    startY: 0,
    lastX: 0,
  });

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (window.innerWidth >= 768 || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const drawerWidth = Math.min(window.innerWidth * 0.82, 360);
      const canOpenFromEdge = !mobileMenuOpen && touch.clientX <= 24;
      const canCloseFromDrawer = mobileMenuOpen && touch.clientX <= drawerWidth;

      if (!canOpenFromEdge && !canCloseFromDrawer) {
        return;
      }

      swipeStateRef.current = {
        tracking: true,
        mode: mobileMenuOpen ? "close" : "open",
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const state = swipeStateRef.current;
      if (!state.tracking || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 12) {
        swipeStateRef.current = { ...state, tracking: false, mode: null };
        return;
      }

      swipeStateRef.current = { ...state, lastX: touch.clientX };
    };

    const onTouchEnd = () => {
      const state = swipeStateRef.current;
      if (!state.tracking || !state.mode) {
        swipeStateRef.current = { ...state, tracking: false, mode: null };
        return;
      }

      const deltaX = state.lastX - state.startX;
      const openThreshold = 70;
      const closeThreshold = -70;

      if (state.mode === "open" && deltaX >= openThreshold) {
        setMobileMenuOpen(true);
      }

      if (state.mode === "close" && deltaX <= closeThreshold) {
        setMobileMenuOpen(false);
      }

      swipeStateRef.current = { ...state, tracking: false, mode: null };
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="pdf-export-control relative">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/70 bg-white/85 text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Открыть меню"
        >
                <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5">
                  <path d="M3 5h14v1.8H3V5Zm0 4.1h14v1.8H3V9.1Zm0 4.1h14V15H3v-1.8Z" fill="currentColor" />
                </svg>
              </button>
        <ThemeToggleButton onThemeToggle={onThemeToggle} compact />
      </div>

      <div className="hidden md:flex md:flex-wrap md:items-center md:justify-between md:gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={navLinkClass(isActive)} aria-current={isActive ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <ThemeToggleButton onThemeToggle={onThemeToggle} />
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Закрыть меню"
          />
          <aside className="relative z-10 h-full w-[82vw] max-w-xs rounded-r-2xl border-r border-zinc-200/70 bg-white/95 p-4 shadow-2xl dark:border-zinc-700/70 dark:bg-zinc-900/95">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Навигация</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/70 bg-white/80 text-zinc-700 dark:border-zinc-700/70 dark:bg-zinc-800/80 dark:text-zinc-200"
                aria-label="Закрыть меню"
              >
                <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4">
                  <path d="m5.2 6.5 1.3-1.3L10 8.7l3.5-3.5 1.3 1.3-3.5 3.5 3.5 3.5-1.3 1.3L10 11.3l-3.5 3.5-1.3-1.3L8.7 10 5.2 6.5Z" fill="currentColor" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${navLinkClass(isActive)} w-full justify-start`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </nav>
  );
};
