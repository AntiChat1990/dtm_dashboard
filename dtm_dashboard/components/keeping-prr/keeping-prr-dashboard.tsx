"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { KeepingPrrActivityTable } from "@/components/keeping-prr/activity-table";
import { KeepingPrrDailyFlow } from "@/components/keeping-prr/daily-flow";
import { KeepingPrrEmptyState } from "@/components/keeping-prr/empty-state";
import { KeepingPrrHeader } from "@/components/keeping-prr/keeping-prr-header";
import { KeepingPrrMonthlyTrend } from "@/components/keeping-prr/monthly-trend";
import { KeepingPrrOverviewCards } from "@/components/keeping-prr/overview-cards";
import type { KeepingPrrDashboardProps } from "@/components/keeping-prr/types";

export const KeepingPrrDashboard = ({ data }: KeepingPrrDashboardProps) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(data.warehouses[0]?.name ?? "");
  const initialMonth = data.warehouses[0]?.months.at(-1)?.id ?? "";
  const [selectedMonthId, setSelectedMonthId] = useState<string>(initialMonth);
  const deferredWarehouse = useDeferredValue(selectedWarehouse);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolvedTheme =
        savedTheme === "dark" || savedTheme === "dtm" ? savedTheme : prefersDark ? "dark" : "light";

      document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
      document.documentElement.classList.toggle("dtm", resolvedTheme === "dtm");
    } catch (error) {
      console.error("Failed to restore theme", error);
    }
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

  const warehouse = useMemo(
    () => data.warehouses.find((item) => item.name === deferredWarehouse) ?? data.warehouses[0] ?? null,
    [data.warehouses, deferredWarehouse],
  );

  const selectedMonth = useMemo(
    () => warehouse?.months.find((month) => month.id === selectedMonthId) ?? warehouse?.months.at(-1) ?? null,
    [warehouse, selectedMonthId],
  );

  const previousMonth = useMemo(() => {
    if (!warehouse || !selectedMonth) {
      return null;
    }

    const index = warehouse.months.findIndex((month) => month.id === selectedMonth.id);
    if (index <= 0) {
      return null;
    }

    return warehouse.months[index - 1] ?? null;
  }, [selectedMonth, warehouse]);

  if (!warehouse || !selectedMonth) {
    return <KeepingPrrEmptyState />;
  }

  return (
    <main className="dtm-theme-scope min-h-screen bg-[radial-gradient(circle_at_top,#d6e7ff_0%,#f7fafc_45%,#ffffff_100%)] px-4 py-8 text-zinc-900 dark:bg-[radial-gradient(circle_at_top,#162033_0%,#0b0f18_45%,#06080e_100%)] dark:text-zinc-100 dtm:bg-[radial-gradient(circle_at_top,#d3f4f7_0%,#effbfc_48%,#ffffff_100%)] dtm:text-teal-950 sm:px-6">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AppNavbar onThemeToggle={toggleTheme} />

        <KeepingPrrHeader
          generatedAt={data.generatedAt}
          monthOptions={[...warehouse.months].reverse()}
          onMonthChange={(monthId) => {
            startTransition(() => setSelectedMonthId(monthId));
          }}
          onWarehouseChange={(warehouseName) => {
            const nextWarehouse = data.warehouses.find((item) => item.name === warehouseName) ?? null;
            const latestMonthId = nextWarehouse?.months.at(-1)?.id ?? "";

            startTransition(() => {
              setSelectedWarehouse(warehouseName);
              setSelectedMonthId(latestMonthId);
            });
          }}
          selectedMonth={selectedMonth}
          selectedWarehouse={warehouse.name}
          warehouseOptions={data.warehouses}
        />

        <KeepingPrrOverviewCards month={selectedMonth} previousMonth={previousMonth} />

        <section className="grid gap-4 lg:grid-cols-[1.1fr,1.4fr]">
          <KeepingPrrMonthlyTrend months={warehouse.months} selectedMonthId={selectedMonth.id} />
          <KeepingPrrDailyFlow month={selectedMonth} />
        </section>

        <KeepingPrrActivityTable month={selectedMonth} />
      </section>
    </main>
  );
};
