"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CurrencyCode, DashboardData } from "@/lib/dashboard-types";

type DashboardProps = {
  data: DashboardData;
};

const toPercent = (value: number): string => `${Math.round(value)}%`;

const formatDeltaPercent = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const formatSharePercent = (value: number): string => `${value.toFixed(1)}%`;
const formatRubRate = (value: number): string =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);

export const Dashboard = ({ data }: DashboardProps) => {
  const months = data.months;
  const [selectedId, setSelectedId] = useState<string>(months.at(-1)?.id ?? "");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("RUB");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const monthMenuRef = useRef<HTMLDivElement | null>(null);
  const currencyMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      // Ignore storage/media query errors.
    }
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (monthMenuRef.current && !monthMenuRef.current.contains(target)) {
        setMonthMenuOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setCurrencyMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    root.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
  };

  const selectedMonth = useMemo(
    () => months.find((month) => month.id === selectedId) ?? months.at(-1) ?? null,
    [months, selectedId],
  );
  const selectedCurrencyMeta = useMemo(
    () => data.currencyRates.find((rate) => rate.code === selectedCurrency) ?? data.currencyRates[0],
    [data.currencyRates, selectedCurrency],
  );
  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: selectedCurrency,
        maximumFractionDigits: 0,
      }),
    [selectedCurrency],
  );
  const formatAmount = (amountRub: number): string => {
    const divisor = selectedCurrencyMeta?.rubRate || 1;
    return moneyFormatter.format(amountRub / divisor);
  };

  const peakMonthRevenue = useMemo(
    () => Math.max(...months.map((month) => month.totalRevenue), 0),
    [months],
  );
  const monthsForTrend = useMemo(() => [...months].reverse(), [months]);

  if (months.length === 0 || !selectedMonth) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-zinc-300 bg-white/80 p-6 text-center text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
          Не найдены Excel-файлы в папке <code className="font-mono">excel_data</code>.
        </div>
      </main>
    );
  }

  const topWarehouses = selectedMonth.warehouses.slice(0, 8);

  const categoryCards = [
    { label: "Сибур", value: selectedMonth.categoryTotals.sibur },
    { label: "Завод", value: selectedMonth.categoryTotals.plant },
    { label: "Русвинил", value: selectedMonth.categoryTotals.rusvinyl },
    { label: "Клиенты Сибура", value: selectedMonth.categoryTotals.siburClients },
    { label: "Остальные", value: selectedMonth.categoryTotals.others },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d6e7ff_0%,#f7fafc_45%,#ffffff_100%)] px-4 py-8 text-zinc-900 dark:bg-[radial-gradient(circle_at_top,#162033_0%,#0b0f18_45%,#06080e_100%)] dark:text-zinc-100 sm:px-6">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 to-sky-50/60 p-6 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:from-zinc-900/80 dark:to-zinc-900/60"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">DTM Dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight">Свод по Excel-отчетам</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Обновлено: {new Date(data.generatedAt).toLocaleString("ru-RU")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <div className="relative" ref={monthMenuRef}>
                <button
                  type="button"
                  onClick={() => setMonthMenuOpen((prev) => !prev)}
                  className="group relative inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span className="text-zinc-500 dark:text-zinc-400">Период</span>
                  <span className="font-semibold">{selectedMonth.label}</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 text-zinc-500 transition group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 ${monthMenuOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                {monthMenuOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95">
                    {months.map((month) => {
                      const isSelected = month.id === selectedMonth.id;
                      return (
                        <button
                          key={month.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(month.id);
                            setMonthMenuOpen(false);
                          }}
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
                  onClick={() => setCurrencyMenuOpen((prev) => !prev)}
                  className="group relative inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span className="text-zinc-500 dark:text-zinc-400">Валюта</span>
                  <span className="font-semibold">
                    {selectedCurrencyMeta?.symbol} {selectedCurrency}
                  </span>
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {formatRubRate(selectedCurrencyMeta?.rubRate ?? 1)} ₽
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
                  <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95">
                    {data.currencyRates.map((rate) => {
                      const isSelected = rate.code === selectedCurrency;
                      return (
                        <button
                          key={rate.code}
                          type="button"
                          onClick={() => {
                            setSelectedCurrency(rate.code);
                            setCurrencyMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                            isSelected
                              ? "bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                          }`}
                        >
                          <span>
                            {rate.symbol} {rate.name} ({rate.code})
                          </span>
                          <span className="text-xs">
                            1 {rate.code} = {formatRubRate(rate.rubRate)} ₽
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Переключить тему"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="h-4 w-4 dark:hidden"
                >
                  <path
                    d="M10 2.75a.75.75 0 0 1 .75.75V5a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75Zm0 11.5A4.25 4.25 0 1 0 10 5.75a4.25 4.25 0 0 0 0 8.5Zm7.25-4.25a.75.75 0 0 1-.75.75H15a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10Zm9.192 4.192a.75.75 0 0 1 1.06 0l.53.53a.75.75 0 1 1-1.06 1.06l-.53-.53a.75.75 0 0 1 0-1.06ZM4.748 4.748a.75.75 0 0 1 1.06 0l.53.53a.75.75 0 1 1-1.06 1.06l-.53-.53a.75.75 0 0 1 0-1.06Zm10.504 0a.75.75 0 0 1 0 1.06l-.53.53a.75.75 0 1 1-1.06-1.06l.53-.53a.75.75 0 0 1 1.06 0ZM5.808 14.192a.75.75 0 0 1 0 1.06l-.53.53a.75.75 0 0 1-1.06-1.06l.53-.53a.75.75 0 0 1 1.06 0Z"
                    fill="currentColor"
                  />
                </svg>
                <svg aria-hidden viewBox="0 0 20 20" className="hidden h-4 w-4 dark:block">
                  <path
                    d="M12.2 3.2a.75.75 0 0 1 .43 1 6.25 6.25 0 1 0 3.17 7.95.75.75 0 1 1 1.4.53A7.75 7.75 0 1 1 12.2 3.2Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="dark:hidden">Светлая</span>
                <span className="hidden dark:inline">Темная</span>
              </button>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-4 md:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Выручка за месяц</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{formatAmount(selectedMonth.totalRevenue)}</p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Складов в отчете</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{selectedMonth.warehouses.length}</p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Доля от пикового месяца</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {toPercent((selectedMonth.totalRevenue / (peakMonthRevenue || 1)) * 100)}
            </p>
          </motion.article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <motion.article
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70"
          >
            <h2 className="text-lg font-semibold">Динамика выручки по месяцам</h2>
            <div className="mt-5 space-y-1.5">
              {monthsForTrend.map((month, index) => {
                const width = Math.max((month.totalRevenue / (peakMonthRevenue || 1)) * 100, 2);
                const active = month.id === selectedMonth.id;
                const previous = monthsForTrend[index + 1];
                const changePercent = previous
                  ? ((month.totalRevenue - previous.totalRevenue) / (previous.totalRevenue || 1)) * 100
                  : null;
                const deltaClass =
                  changePercent === null
                    ? "text-zinc-500 dark:text-zinc-400"
                    : changePercent >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400";

                return (
                  <div
                    key={month.id}
                    className="rounded-xl border border-zinc-200/70 bg-white/75 px-2.5 py-2 dark:border-zinc-700/70 dark:bg-zinc-900/45"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{month.label}</span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="inline-flex w-auto rounded-md bg-sky-100 px-2 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                          {formatAmount(month.totalRevenue)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold ${
                            changePercent === null
                              ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300"
                              : changePercent >= 0
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          <span aria-hidden>{changePercent === null ? "•" : changePercent >= 0 ? "↗" : "↘"}</span>
                          <span className={deltaClass}>
                            {changePercent === null ? "—" : formatDeltaPercent(changePercent)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className={
                          active ? "h-full rounded-full bg-sky-500" : "h-full rounded-full bg-zinc-400"
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70"
          >
            <h2 className="text-lg font-semibold">Структура выручки</h2>
            <div className="mt-4 space-y-3">
              {categoryCards.map((item) => {
                const ratio = (item.value / (selectedMonth.totalRevenue || 1)) * 100;
                const shareClass =
                  ratio >= 20
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-sky-100 px-2 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                          {formatAmount(item.value)}
                        </span>
                        <span className={`rounded-lg px-2 py-1 text-sm font-semibold ${shareClass}`}>
                          {formatSharePercent(ratio)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(ratio, 1)}%` }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="h-full rounded-full bg-sky-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.article>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70"
        >
          <h2 className="text-lg font-semibold">Топ складов за {selectedMonth.label}</h2>
          <div className="mt-4 space-y-2">
            {topWarehouses.map((warehouse) => {
              const share = (warehouse.total / (selectedMonth.totalRevenue || 1)) * 100;
              return (
                <div
                  key={warehouse.warehouse}
                  className="rounded-xl border border-zinc-200/70 bg-white/75 px-3 py-2.5 transition hover:bg-zinc-100/70 dark:border-zinc-700/70 dark:bg-zinc-900/45 dark:hover:bg-zinc-800/55"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{warehouse.warehouse}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-sky-100 px-2 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                        {formatAmount(warehouse.total)}
                      </span>
                      <span className="rounded-lg bg-zinc-100 px-2 py-1 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        {formatSharePercent(share)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(share, 1)}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="h-full rounded-full bg-sky-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </section>
    </main>
  );
};
