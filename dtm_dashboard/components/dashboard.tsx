"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getCategoryCards } from "@/components/dashboard/formatters";
import { RevenueStructure } from "@/components/dashboard/revenue-structure";
import { RevenueTrend } from "@/components/dashboard/revenue-trend";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { WarehouseList } from "@/components/dashboard/warehouse-list";
import type { CurrencyCode, DashboardData } from "@/lib/dashboard-types";

type DashboardProps = {
  data: DashboardData;
};

export const Dashboard = ({ data }: DashboardProps) => {
  const months = data.months;
  const [selectedId, setSelectedId] = useState<string>(months.at(-1)?.id ?? "");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("RUB");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [expandedWarehouse, setExpandedWarehouse] = useState<string | null>(null);
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
    } catch (error) {
      console.error("Failed to restore theme", error);
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
      return `\u20BF${btcFormatter.format(converted)}`;
    }

    return moneyFormatter ? moneyFormatter.format(converted) : `${converted}`;
  };

  const peakMonthRevenue = useMemo(() => Math.max(...months.map((month) => month.totalRevenue), 0), [months]);
  const monthsForTrend = useMemo(() => [...months].reverse(), [months]);

  if (months.length === 0 || !selectedMonth || !selectedCurrencyMeta) {
    return <EmptyState />;
  }

  const topWarehouses = selectedMonth.warehouses.filter((warehouse) => warehouse.total > 0);
  const averageRevenuePerWarehouse =
    topWarehouses.length > 0 ? selectedMonth.totalRevenue / topWarehouses.length : 0;
  const categoryCards = getCategoryCards(selectedMonth);

  return (
    <main className="pdf-report-root dtm-theme-scope min-h-screen bg-[radial-gradient(circle_at_top,#d6e7ff_0%,#f7fafc_45%,#ffffff_100%)] px-4 py-8 text-zinc-900 dark:bg-[radial-gradient(circle_at_top,#162033_0%,#0b0f18_45%,#06080e_100%)] dark:text-zinc-100 dtm:bg-[radial-gradient(circle_at_top,#d3f4f7_0%,#effbfc_48%,#ffffff_100%)] dtm:text-teal-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DashboardHeader
          currencyMenuOpen={currencyMenuOpen}
          currencyMenuRef={currencyMenuRef}
          currencyRates={data.currencyRates}
          generatedAt={data.generatedAt}
          monthMenuOpen={monthMenuOpen}
          monthMenuRef={monthMenuRef}
          monthsForTrend={monthsForTrend}
          onCurrencyMenuToggle={() => setCurrencyMenuOpen((prev) => !prev)}
          onCurrencySelect={(code) => {
            setSelectedCurrency(code);
            setCurrencyMenuOpen(false);
          }}
          onMonthMenuToggle={() => setMonthMenuOpen((prev) => !prev)}
          onMonthSelect={(monthId) => {
            setSelectedId(monthId);
            setExpandedWarehouse(null);
            setMonthMenuOpen(false);
          }}
          onThemeToggle={toggleTheme}
          selectedCurrency={selectedCurrency}
          selectedCurrencyMeta={selectedCurrencyMeta}
          selectedMonth={selectedMonth}
        />

        <SummaryCards
          averageRevenuePerWarehouse={averageRevenuePerWarehouse}
          formatAmount={formatAmount}
          peakMonthRevenue={peakMonthRevenue}
          selectedMonth={selectedMonth}
          topWarehousesCount={topWarehouses.length}
        />

        <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <RevenueTrend
            formatAmount={formatAmount}
            monthsForTrend={monthsForTrend}
            peakMonthRevenue={peakMonthRevenue}
            selectedMonthId={selectedMonth.id}
          />
          <RevenueStructure
            categoryCards={categoryCards}
            formatAmount={formatAmount}
            previousMonth={previousMonth}
            selectedMonth={selectedMonth}
          />
        </section>

        <WarehouseList
          expandedWarehouse={expandedWarehouse}
          formatAmount={formatAmount}
          onWarehouseToggle={(warehouseName, hasBreakdown) => {
            if (!hasBreakdown) {
              return;
            }

            setExpandedWarehouse((prev) => (prev === warehouseName ? null : warehouseName));
          }}
          previousMonth={previousMonth}
          selectedMonth={selectedMonth}
          warehouses={topWarehouses}
        />
      </section>
    </main>
  );
};
