import { motion } from "framer-motion";
import { formatCompactDate, formatTonnes } from "@/components/keeping-prr/formatters";
import type { KeepingPrrDailyFlowProps } from "@/components/keeping-prr/types";

export const KeepingPrrDailyFlow = ({ month }: KeepingPrrDailyFlowProps) => {
  const maxMovement = Math.max(...month.days.map((day) => Math.max(day.inbound, day.outbound)), 1);
  const stockRange = Math.max(month.maxStock - month.minStock, 1);
  const svgWidth = 820;
  const svgHeight = 140;

  const polylinePoints = month.days
    .map((day, index) => {
      const x = month.days.length > 1 ? (index / (month.days.length - 1)) * svgWidth : svgWidth / 2;
      const normalized = (day.stock - month.minStock) / stockRange;
      const y = svgHeight - normalized * (svgHeight - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <motion.article
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
      className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
    >
      <h2 className="text-lg font-semibold">Дневной поток и траектория остатка</h2>
      <div className="mt-4 rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/50 dtm:border-teal-200/70 dtm:bg-white/90">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>Мин: {formatTonnes(month.minStock)}</span>
          <span>Макс: {formatTonnes(month.maxStock)}</span>
        </div>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="mt-2 h-32 w-full">
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-sky-500 dark:text-sky-300"
          />
        </svg>
      </div>
      <div className="app-scrollbar mt-4 grid max-h-[420px] gap-1.5 overflow-y-auto pr-1">
        {month.days.map((day) => {
          const inboundWidth = Math.max((day.inbound / maxMovement) * 100, 1);
          const outboundWidth = Math.max((day.outbound / maxMovement) * 100, 1);

          return (
            <div
              key={day.dateIso}
              className="rounded-lg border border-zinc-200/70 bg-white/70 px-3 py-2 dark:border-zinc-700/70 dark:bg-zinc-900/45 dtm:border-teal-200/70 dtm:bg-white/85"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">{formatCompactDate(day.dateIso)}</span>
                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  Остаток {formatTonnes(day.stock)}
                </span>
              </div>
              <div className="mt-2 grid gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-xs text-zinc-500 dark:text-zinc-400">Приход</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${inboundWidth}%` }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                  <span className="w-20 text-right text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {formatTonnes(day.inbound)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-xs text-zinc-500 dark:text-zinc-400">Расход</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 dtm:bg-teal-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${outboundWidth}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="h-full rounded-full bg-rose-500"
                    />
                  </div>
                  <span className="w-20 text-right text-xs font-semibold text-rose-700 dark:text-rose-300">
                    {formatTonnes(day.outbound)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
};
