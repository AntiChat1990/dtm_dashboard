import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { KeepingPrrHeaderProps } from "@/components/keeping-prr/types";

export const KeepingPrrHeader = ({
  generatedAt,
  monthOptions,
  onMonthChange,
  onWarehouseChange,
  selectedMonth,
  selectedWarehouse,
  warehouseOptions,
}: KeepingPrrHeaderProps) => {
  const [warehouseMenuOpen, setWarehouseMenuOpen] = useState(false);
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const warehouseMenuRef = useRef<HTMLDivElement | null>(null);
  const monthMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (warehouseMenuRef.current && !warehouseMenuRef.current.contains(target)) {
        setWarehouseMenuOpen(false);
      }

      if (monthMenuRef.current && !monthMenuRef.current.contains(target)) {
        setMonthMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="rounded-2xl border border-white/70 bg-gradient-to-br from-white/95 to-cyan-50/65 p-6 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:from-zinc-900/85 dark:to-zinc-900/65 dtm:border-teal-200/80 dtm:from-teal-50/95 dtm:to-cyan-50/70"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Image
              src="/dtm-logo.svg"
              alt="DTM logo"
              width={252}
              height={60}
              loading="eager"
              className="dtm-brand-logo h-14 w-auto"
            />
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Обновлено: {new Date(generatedAt).toLocaleString("ru-RU")}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative" ref={warehouseMenuRef}>
            <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">Склад</p>
            <button
              type="button"
              onClick={() => setWarehouseMenuOpen((prev) => !prev)}
              className="group relative inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="truncate font-semibold">{selectedWarehouse}</span>
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className={`h-4 w-4 text-zinc-500 transition group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 ${warehouseMenuOpen ? "rotate-180" : ""}`}
              >
                <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            {warehouseMenuOpen ? (
              <div className="app-scrollbar absolute left-0 z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95">
                {warehouseOptions.map((warehouse) => {
                  const isSelected = warehouse.name === selectedWarehouse;

                  return (
                    <button
                      key={warehouse.name}
                      type="button"
                      onClick={() => {
                        onWarehouseChange(warehouse.name);
                        setWarehouseMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                        isSelected
                          ? "bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
                      }`}
                    >
                      <span>{warehouse.name}</span>
                      {isSelected ? <span aria-hidden>✓</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="relative" ref={monthMenuRef}>
            <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">Период</p>
            <button
              type="button"
              onClick={() => setMonthMenuOpen((prev) => !prev)}
              className="group relative inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200/70 bg-white/85 px-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="truncate font-semibold">{selectedMonth.label}</span>
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className={`h-4 w-4 text-zinc-500 transition group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200 ${monthMenuOpen ? "rotate-180" : ""}`}
              >
                <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            {monthMenuOpen ? (
              <div className="app-scrollbar absolute left-0 z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95">
                {monthOptions.map((month) => {
                  const isSelected = month.id === selectedMonth.id;

                  return (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => {
                        onMonthChange(month.id);
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
        </div>
      </div>
    </motion.header>
  );
};
