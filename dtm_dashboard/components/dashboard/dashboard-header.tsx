import { motion } from "framer-motion";
import Image from "next/image";
import { formatRubRate } from "@/components/dashboard/formatters";
import type { DashboardHeaderProps } from "@/components/dashboard/types";

export const DashboardHeader = ({
  currencyMenuOpen,
  currencyMenuRef,
  currencyRates,
  generatedAt,
  monthMenuOpen,
  monthMenuRef,
  monthsForTrend,
  onCurrencyMenuToggle,
  onCurrencySelect,
  onMonthMenuToggle,
  onMonthSelect,
  onThemeToggle,
  selectedCurrency,
  selectedCurrencyMeta,
  selectedMonth,
}: DashboardHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 to-sky-50/60 p-6 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:from-zinc-900/80 dark:to-zinc-900/60 dtm:border-teal-200/80 dtm:from-teal-50/90 dtm:to-cyan-50/70"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Image
            src="/dtm-logo.svg"
            alt="DTM logo"
            width={252}
            height={60}
            loading="eager"
            className="dtm-brand-logo h-14 w-auto"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Обновлено: {new Date(generatedAt).toLocaleString("ru-RU")}</p>
        </div>
        <div className="pdf-export-control flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          <div className="relative" ref={monthMenuRef}>
            <button
              type="button"
              onClick={onMonthMenuToggle}
              className="group relative inline-flex h-10 w-[246px] min-w-0 items-center justify-between gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">Период</span>
              <span className="max-w-[130px] truncate whitespace-nowrap font-semibold sm:max-w-none">{selectedMonth.label}</span>
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className={`h-4 w-4 text-zinc-500 transition group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 ${monthMenuOpen ? "rotate-180" : ""}`}
              >
                <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            {monthMenuOpen ? (
              <div className="absolute left-0 right-auto z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95 sm:left-auto sm:right-0 sm:w-56">
                {monthsForTrend.map((month) => {
                  const isSelected = month.id === selectedMonth.id;

                  return (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => onMonthSelect(month.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                        isSelected
                          ? "bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                      }`}
                    >
                      <span>{month.label}</span>
                      {isSelected ? <span aria-hidden>✓</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="relative" ref={currencyMenuRef}>
            <button
              type="button"
              onClick={onCurrencyMenuToggle}
              className="group relative inline-flex h-10 w-[246px] min-w-0 items-center justify-between gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">Валюта</span>
              <span className="whitespace-nowrap font-semibold">
                {selectedCurrencyMeta.symbol} {selectedCurrency}
              </span>
              <span className="whitespace-nowrap rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {formatRubRate(selectedCurrencyMeta.rubRate)} ₽
              </span>
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className={`h-4 w-4 text-zinc-500 transition group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 ${currencyMenuOpen ? "rotate-180" : ""}`}
              >
                <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            {currencyMenuOpen ? (
              <div className="absolute left-0 right-auto z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95 sm:left-auto sm:right-0 sm:w-72">
                {currencyRates.map((rate) => {
                  const isSelected = rate.code === selectedCurrency;

                  return (
                    <button
                      key={rate.code}
                      type="button"
                      onClick={() => onCurrencySelect(rate.code)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                        isSelected
                          ? "bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                      }`}
                    >
                      <span>
                        {rate.symbol} {rate.name} ({rate.code})
                      </span>
                      <span className="text-xs">1 {rate.code} = {formatRubRate(rate.rubRate)} ₽</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onThemeToggle}
            className="inline-flex h-10 w-[246px] items-center justify-center gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
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
        </div>
      </div>
    </motion.header>
  );
};
