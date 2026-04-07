import { motion } from "framer-motion";
import { formatDeltaPercent } from "@/components/dashboard/formatters";
import type { RevenueTrendProps } from "@/components/dashboard/types";

export const RevenueTrend = ({
  formatAmount,
  monthsForTrend,
  peakMonthRevenue,
  selectedMonthId,
}: RevenueTrendProps) => {
  return (
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
          const active = month.id === selectedMonthId;
          const previous = monthsForTrend[index + 1] ?? null;
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
                    <span className={deltaClass}>{changePercent === null ? "—" : formatDeltaPercent(changePercent)}</span>
                  </span>
                </div>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className={active ? "h-full rounded-full bg-sky-500" : "h-full rounded-full bg-zinc-400"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};
