import { AnimatePresence, motion } from "framer-motion";
import {
  formatSharePercent,
  formatSignedAmount,
  getDeltaBadgeClass,
} from "@/components/dashboard/formatters";
import type { WarehouseBreakdownProps, WarehouseListProps } from "@/components/dashboard/types";

const WarehouseBreakdown = ({ breakdown, formatAmount, total, warehouseName }: WarehouseBreakdownProps) => {
  return (
    <div className="mt-3 rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/55 dtm:border-teal-200/70 dtm:bg-white/90">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Из чего сформирована выручка
      </p>
      <div className="space-y-2">
        {breakdown.map((item) => {
          const breakdownShare = (item.amount / (total || 1)) * 100;

          return (
            <div key={`${warehouseName}-${item.source}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{item.source}</span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                    {formatAmount(item.amount)}
                  </span>
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {formatSharePercent(breakdownShare)}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(breakdownShare, 1)}%` }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="h-full rounded-full bg-sky-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WarehouseList = ({
  expandedWarehouse,
  formatAmount,
  onWarehouseToggle,
  previousMonth,
  selectedMonth,
  warehouses,
}: WarehouseListProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
    >
      <h2 className="text-lg font-semibold">Топ складов за {selectedMonth.label}</h2>
      <div className="mt-4 space-y-2">
        {warehouses.map((warehouse) => {
          const share = (warehouse.total / (selectedMonth.totalRevenue || 1)) * 100;
          const previousTotal =
            previousMonth?.warehouses.find((item) => item.warehouse === warehouse.warehouse)?.total ?? 0;
          const amountDelta = warehouse.total - previousTotal;
          const percentDelta = previousTotal > 0 ? (amountDelta / previousTotal) * 100 : warehouse.total > 0 ? 100 : 0;
          const hasBreakdown = warehouse.breakdown.length > 0;
          const isExpanded = expandedWarehouse === warehouse.warehouse;
          const isPositive = amountDelta >= 0;
          const deltaBadgeClass = getDeltaBadgeClass(isPositive);
          const deltaSign = amountDelta >= 0 ? "+" : "";

          return (
            <div
              key={warehouse.warehouse}
              className="rounded-xl border border-zinc-200/70 bg-white/75 px-3 py-2.5 transition hover:bg-zinc-100/70 dark:border-zinc-700/70 dark:bg-zinc-900/45 dark:hover:bg-zinc-800/55 dtm:border-teal-200/70 dtm:bg-white/85 dtm:hover:bg-teal-50/90"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <button
                  type="button"
                  onClick={() => onWarehouseToggle(warehouse.warehouse, hasBreakdown)}
                  className={`inline-flex items-center gap-1.5 text-left text-base font-semibold ${hasBreakdown ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span>{warehouse.warehouse}</span>
                  {hasBreakdown ? (
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 text-zinc-500 transition dark:text-zinc-400 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  ) : null}
                </button>
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
              <AnimatePresence initial={false}>
                {isExpanded && hasBreakdown ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <WarehouseBreakdown
                      breakdown={warehouse.breakdown}
                      formatAmount={formatAmount}
                      total={warehouse.total}
                      warehouseName={warehouse.warehouse}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
};
