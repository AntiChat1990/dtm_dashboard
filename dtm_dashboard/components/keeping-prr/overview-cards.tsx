import { motion } from "framer-motion";
import { formatPercent, formatSignedTonnes, formatTonnes } from "@/components/keeping-prr/formatters";
import type { KeepingPrrOverviewCardsProps } from "@/components/keeping-prr/types";

export const KeepingPrrOverviewCards = ({ month, previousMonth }: KeepingPrrOverviewCardsProps) => {
  const stockDelta = month.closingStock - month.openingStock;
  const previousClosing = previousMonth?.closingStock ?? 0;
  const monthToMonthStock =
    previousMonth && previousClosing !== 0 ? ((month.closingStock - previousClosing) / previousClosing) * 100 : null;
  const stockSpread = month.maxStock - month.minStock;
  const correctionsDelta = month.totalInboundCorrection - month.totalOutboundCorrection;

  return (
    <section className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Остаток на конец</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatTonnes(month.closingStock)}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Изменение за месяц: <span className="font-semibold">{formatSignedTonnes(stockDelta)}</span>
        </p>
      </motion.article>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Нетто-поток месяца</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatSignedTonnes(month.netFlow)}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Приход {formatTonnes(month.totalInbound)} · Расход {formatTonnes(month.totalOutbound)}
        </p>
      </motion.article>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Средний дневной оборот</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatTonnes(month.averageDailyTurnover)}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Средний остаток {formatTonnes(month.averageStock)} · Амплитуда {formatTonnes(stockSpread)}
        </p>
      </motion.article>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Корректировки</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatSignedTonnes(correctionsDelta)}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Приход {formatTonnes(month.totalInboundCorrection)} · Расход {formatTonnes(month.totalOutboundCorrection)}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Месяц к месяцу: {monthToMonthStock === null ? "—" : formatPercent(monthToMonthStock)}
        </p>
      </motion.article>
    </section>
  );
};
