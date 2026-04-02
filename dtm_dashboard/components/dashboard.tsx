"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
const formatSignedAmount = (value: number, formatAmount: (amountRub: number) => string): string =>
  `${value >= 0 ? "+" : "−"}${formatAmount(Math.abs(value))}`;
type CategoryKey = "sibur" | "plant" | "rusvinyl" | "siburClients" | "others";

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
      const resolvedTheme =
        savedTheme === "dark" || savedTheme === "dtm"
          ? savedTheme
          : prefersDark
            ? "dark"
            : "light";
      document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
      document.documentElement.classList.toggle("dtm", resolvedTheme === "dtm");
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
    const isDtm = root.classList.contains("dtm");
    const nextTheme = isDark ? "dtm" : isDtm ? "light" : "dark";
    root.classList.toggle("dark", nextTheme === "dark");
    root.classList.toggle("dtm", nextTheme === "dtm");
    localStorage.setItem("theme", nextTheme);
  };

  const selectedMonth = useMemo(
    () => months.find((month) => month.id === selectedId) ?? months.at(-1) ?? null,
    [months, selectedId],
  );
  const previousMonth = useMemo(() => {
    const currentIndex = months.findIndex((month) => month.id === selectedId);
    if (currentIndex <= 0) {
      return null;
    }
    return months[currentIndex - 1] ?? null;
  }, [months, selectedId]);
  const selectedCurrencyMeta = useMemo(
    () => data.currencyRates.find((rate) => rate.code === selectedCurrency) ?? data.currencyRates[0],
    [data.currencyRates, selectedCurrency],
  );
  const moneyFormatter = useMemo(() => {
    if (selectedCurrency === "BTC") {
      return null;
    }
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: selectedCurrency,
      maximumFractionDigits: 0,
    });
  }, [selectedCurrency]);
  const btcFormatter = useMemo(
    () =>
      new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      }),
    [],
  );
  const formatAmount = (amountRub: number): string => {
    const divisor = selectedCurrencyMeta?.rubRate || 1;
    const converted = amountRub / divisor;
    if (selectedCurrency === "BTC") {
      return `₿${btcFormatter.format(converted)}`;
    }
    return moneyFormatter ? moneyFormatter.format(converted) : `${converted}`;
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

  const topWarehouses = selectedMonth.warehouses.filter((warehouse) => warehouse.total > 0);
  const averageRevenuePerWarehouse =
    topWarehouses.length > 0 ? selectedMonth.totalRevenue / topWarehouses.length : 0;

  const categoryCards: Array<{ key: CategoryKey; label: string; value: number }> = [
    { key: "sibur", label: "Сибур", value: selectedMonth.categoryTotals.sibur },
    { key: "plant", label: "Завод", value: selectedMonth.categoryTotals.plant },
    { key: "rusvinyl", label: "Русвинил", value: selectedMonth.categoryTotals.rusvinyl },
    { key: "siburClients", label: "Клиенты Сибура", value: selectedMonth.categoryTotals.siburClients },
    { key: "others", label: "Остальные", value: selectedMonth.categoryTotals.others },
  ];

  return (
    <main className="dtm-theme-scope min-h-screen bg-[radial-gradient(circle_at_top,#d6e7ff_0%,#f7fafc_45%,#ffffff_100%)] px-4 py-8 text-zinc-900 dark:bg-[radial-gradient(circle_at_top,#162033_0%,#0b0f18_45%,#06080e_100%)] dark:text-zinc-100 dtm:bg-[radial-gradient(circle_at_top,#d3f4f7_0%,#effbfc_48%,#ffffff_100%)] dtm:text-teal-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 to-sky-50/60 p-6 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:from-zinc-900/80 dark:to-zinc-900/60 dtm:border-teal-200/80 dtm:from-teal-50/90 dtm:to-cyan-50/70"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <Image src="/dtm-logo.svg" alt="DTM logo" width={252} height={60} className="dtm-brand-logo h-14 w-auto" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Обновлено: {new Date(data.generatedAt).toLocaleString("ru-RU")}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
              <div className="relative" ref={monthMenuRef}>
                <button
                  type="button"
                  onClick={() => setMonthMenuOpen((prev) => !prev)}
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
                  className="group relative inline-flex h-10 w-[246px] min-w-0 items-center justify-between gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">Валюта</span>
                  <span className="whitespace-nowrap font-semibold">
                    {selectedCurrencyMeta?.symbol} {selectedCurrency}
                  </span>
                  <span className="whitespace-nowrap rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
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
                  <div className="absolute left-0 right-auto z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95 sm:left-auto sm:right-0 sm:w-72">
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
                  <path
                    d="M6 13H9V15H6V13ZM6 10H9V12H6V10ZM10.5 12H14V15H10.5V12Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="dark:hidden dtm:hidden">Светлая</span>
                <span className="hidden dark:inline dtm:hidden">Темная</span>
                <span className="hidden dtm:inline">DTM</span>
              </button>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-4 md:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Выручка за месяц</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{formatAmount(selectedMonth.totalRevenue)}</p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Средняя выручка на склад</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{formatAmount(averageRevenuePerWarehouse)}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Складов с прибылью: {topWarehouses.length}</p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
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
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
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
                    className="rounded-xl border border-zinc-200/70 bg-white/75 px-2.5 py-2 dark:border-zinc-700/70 dark:bg-zinc-900/45 dtm:border-teal-200/70 dtm:bg-white/85"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <span className="text-base font-semibold text-zinc-700 dark:text-zinc-200">{month.label}</span>
                      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:justify-end">
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
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
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
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
          >
            <h2 className="text-lg font-semibold">Структура выручки</h2>
            <div className="mt-4 space-y-3">
              {categoryCards.map((item) => {
                const ratio = (item.value / (selectedMonth.totalRevenue || 1)) * 100;
                const previousValue = previousMonth?.categoryTotals[item.key] ?? 0;
                const amountDelta = item.value - previousValue;
                const percentDelta =
                  previousValue > 0 ? (amountDelta / previousValue) * 100 : item.value > 0 ? 100 : 0;
                const isPositive = amountDelta >= 0;
                const deltaBadgeClass = isPositive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
                const deltaSign = amountDelta >= 0 ? "+" : "";
                const shareClass = "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/50 dtm:border-teal-200/70 dtm:bg-white/85"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <span className="text-base font-semibold text-zinc-700 dark:text-zinc-200">{item.label}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-sky-100 px-2 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                          {formatAmount(item.value)}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold ${deltaBadgeClass}`}>
                          <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3">
                            {isPositive ? (
                              <path d="M8 2l4 4H9v8H7V6H4l4-4z" fill="currentColor" />
                            ) : (
                              <path d="M8 14l-4-4h3V2h2v8h3l-4 4z" fill="currentColor" />
                            )}
                          </svg>
                          <span>{formatSignedAmount(amountDelta, formatAmount)}</span>
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold ${deltaBadgeClass}`}>
                          <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3">
                            {isPositive ? (
                              <path d="M3 10l3-3 2 2 5-5 1 1-6 6-2-2-2 2z" fill="currentColor" />
                            ) : (
                              <path d="M3 6l3 3 2-2 5 5 1-1-6-6-2 2-2-2z" fill="currentColor" />
                            )}
                          </svg>
                          <span>{`${deltaSign}${percentDelta.toFixed(1)}%`}</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(ratio, 1)}%` }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="h-full rounded-full bg-sky-500"
                        />
                      </div>
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${shareClass}`}>
                        {formatSharePercent(ratio)}
                      </span>
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
          className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
        >
          <h2 className="text-lg font-semibold">Топ складов за {selectedMonth.label}</h2>
          <div className="mt-4 space-y-2">
            {topWarehouses.map((warehouse) => {
              const share = (warehouse.total / (selectedMonth.totalRevenue || 1)) * 100;
              const previousTotal =
                previousMonth?.warehouses.find((item) => item.warehouse === warehouse.warehouse)?.total ?? 0;
              const amountDelta = warehouse.total - previousTotal;
              const percentDelta =
                previousTotal > 0 ? (amountDelta / previousTotal) * 100 : warehouse.total > 0 ? 100 : 0;
              const isPositive =
                amountDelta >= 0
                  ? true
                  : false;
              const deltaBadgeClass = isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
              const deltaSign = amountDelta >= 0 ? "+" : "";

              return (
                <div
                  key={warehouse.warehouse}
                  className="rounded-xl border border-zinc-200/70 bg-white/75 px-3 py-2.5 transition hover:bg-zinc-100/70 dark:border-zinc-700/70 dark:bg-zinc-900/45 dark:hover:bg-zinc-800/55 dtm:border-teal-200/70 dtm:bg-white/85 dtm:hover:bg-teal-50/90"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="text-base font-semibold">{warehouse.warehouse}</span>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="rounded-lg bg-sky-100 px-2 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                        {formatAmount(warehouse.total)}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold ${deltaBadgeClass}`}>
                        <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3">
                          {isPositive ? (
                            <path d="M8 2l4 4H9v8H7V6H4l4-4z" fill="currentColor" />
                          ) : (
                            <path d="M8 14l-4-4h3V2h2v8h3l-4 4z" fill="currentColor" />
                          )}
                        </svg>
                        <span>{formatSignedAmount(amountDelta, formatAmount)}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold ${deltaBadgeClass}`}>
                        <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3">
                          {isPositive ? (
                            <path d="M3 10l3-3 2 2 5-5 1 1-6 6-2-2-2 2z" fill="currentColor" />
                          ) : (
                            <path d="M3 6l3 3 2-2 5 5 1-1-6-6-2 2-2-2z" fill="currentColor" />
                          )}
                        </svg>
                        <span>{`${deltaSign}${percentDelta.toFixed(1)}%`}</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(share, 1)}%` }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="h-full rounded-full bg-sky-500"
                      />
                    </div>
                    <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {formatSharePercent(share)}
                    </span>
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
