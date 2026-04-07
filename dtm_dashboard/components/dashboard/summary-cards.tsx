import { motion } from "framer-motion";
import { toPercent } from "@/components/dashboard/formatters";
import type { SummaryCardsProps } from "@/components/dashboard/types";

export const SummaryCards = ({
  averageRevenuePerWarehouse,
  formatAmount,
  peakMonthRevenue,
  selectedMonth,
  topWarehousesCount,
}: SummaryCardsProps) => {
  return (
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
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Складов с прибылью: {topWarehousesCount}</p>
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
  );
};
