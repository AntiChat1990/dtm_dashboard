import { motion } from "framer-motion";
import {
  formatSharePercent,
  formatSignedAmount,
  getDeltaBadgeClass,
} from "@/components/dashboard/formatters";
import type { RevenueStructureProps } from "@/components/dashboard/types";

export const RevenueStructure = ({
  categoryCards,
  formatAmount,
  previousMonth,
  selectedMonth,
}: RevenueStructureProps) => {
  return (
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
          const percentDelta = previousValue > 0 ? (amountDelta / previousValue) * 100 : item.value > 0 ? 100 : 0;
          const isPositive = amountDelta >= 0;
          const deltaBadgeClass = getDeltaBadgeClass(isPositive);
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
                <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${shareClass}`}>{formatSharePercent(ratio)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};
