import { motion } from "framer-motion";
import { formatSignedTonnes, formatTonnes } from "@/components/keeping-prr/formatters";
import type { KeepingPrrMonthlyTrendProps } from "@/components/keeping-prr/types";

export const KeepingPrrMonthlyTrend = ({ months, selectedMonthId }: KeepingPrrMonthlyTrendProps) => {
  const maxValue = Math.max(...months.flatMap((month) => [month.totalInbound, month.totalOutbound]), 1);

  return (
    <motion.article
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
    >
      <h2 className="text-lg font-semibold">Динамика по месяцам</h2>
      <div className="mt-4 space-y-2.5">
        {[...months].reverse().map((month) => {
          const inboundWidth = Math.max((month.totalInbound / maxValue) * 100, 2);
          const outboundWidth = Math.max((month.totalOutbound / maxValue) * 100, 2);
          const active = month.id === selectedMonthId;

          return (
            <div
              key={month.id}
              className={`rounded-xl border px-3 py-3 transition ${
                active
                  ? "border-sky-200 bg-sky-50/65 dark:border-sky-700/80 dark:bg-sky-900/25"
                  : "border-zinc-200/70 bg-white/70 dark:border-zinc-700/70 dark:bg-zinc-900/50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{month.label}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    +{formatTonnes(month.totalInbound)}
                  </span>
                  <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    −{formatTonnes(month.totalOutbound)}
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {formatSignedTonnes(month.netFlow)}
                  </span>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${inboundWidth}%` }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${outboundWidth}%` }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="h-full rounded-full bg-rose-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};
