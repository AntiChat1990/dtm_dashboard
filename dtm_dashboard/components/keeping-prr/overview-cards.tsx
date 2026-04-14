import { motion } from "framer-motion";
import { formatPercent, formatSignedTonnes, formatTonnes } from "@/components/keeping-prr/formatters";
import type { KeepingPrrOverviewCardsProps } from "@/components/keeping-prr/types";

const getUtilization = (value: number, limit: number | null): number | null => {
  if (!limit || limit <= 0) {
    return null;
  }

  return (value / limit) * 100;
};

const getUtilizationColor = (value: number | null): string => {
  if (value === null) {
    return "bg-zinc-300 dark:bg-zinc-600";
  }

  if (value >= 100) {
    return "bg-rose-500";
  }

  if (value >= 85) {
    return "bg-amber-500";
  }

  return "bg-emerald-500";
};

const UtilizationBar = ({ value }: { value: number | null }) => {
  const barWidth = `${Math.min(Math.max(value ?? 0, 0), 140)}%`;

  return (
    <div className="mt-2 h-2 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-700/80">
      <div className={`h-full rounded-full transition-all ${getUtilizationColor(value)}`} style={{ width: barWidth }} />
    </div>
  );
};

const UtilizationInfo = ({ value, limit }: { value: number | null; limit: number | null }) => (
  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
    {value === null || limit === null ? "Лимит не задан" : `${formatPercent(value)} от лимита (${formatTonnes(limit)})`}
  </p>
);

export const KeepingPrrOverviewCards = ({ warehouse, month, previousMonth }: KeepingPrrOverviewCardsProps) => {
  const stockDelta = month.closingStock - month.openingStock;
  const previousClosing = previousMonth?.closingStock ?? 0;
  const monthToMonthStock =
    previousMonth && previousClosing !== 0 ? ((month.closingStock - previousClosing) / previousClosing) * 100 : null;
  const stockSpread = month.maxStock - month.minStock;
  const maxStock = warehouse.limits?.maxStock ?? null;
  const maxWork = warehouse.limits?.maxWork ?? null;

  const closingUtilization = getUtilization(month.closingStock, maxStock);
  const turnoverUtilization = getUtilization(month.averageDailyTurnover, maxWork);
  const averageStorageUtilization = getUtilization(month.averageStock, maxStock);

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
        <UtilizationBar value={closingUtilization} />
        <UtilizationInfo value={closingUtilization} limit={maxStock} />
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
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Средний дневной оборот
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatTonnes(month.averageDailyTurnover)}</p>
        <UtilizationBar value={turnoverUtilization} />
        <UtilizationInfo value={turnoverUtilization} limit={maxWork} />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Амплитуда {formatTonnes(stockSpread)}
        </p>
      </motion.article>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Среднее хранение</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatTonnes(month.averageStock)}</p>
        <UtilizationBar value={averageStorageUtilization} />
        <UtilizationInfo value={averageStorageUtilization} limit={maxStock} />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Месяц к месяцу по остатку: {monthToMonthStock === null ? "—" : formatPercent(monthToMonthStock)}
        </p>
      </motion.article>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Нетто-поток месяца</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatSignedTonnes(month.netFlow)}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Приход {formatTonnes(month.totalInbound)} · Расход {formatTonnes(month.totalOutbound)}
        </p>
      </motion.article>
    </section>
  );
};
