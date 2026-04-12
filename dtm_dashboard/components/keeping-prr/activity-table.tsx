import { motion } from "framer-motion";
import { formatCompactDate, formatSignedTonnes, formatTonnes } from "@/components/keeping-prr/formatters";
import type { KeepingPrrActivityTableProps } from "@/components/keeping-prr/types";

export const KeepingPrrActivityTable = ({ month }: KeepingPrrActivityTableProps) => {
  const averageMovement = month.days.reduce((acc, day) => acc + day.movement, 0) / month.days.length;
  const topDays = [...month.days].sort((a, b) => b.movement - a.movement).slice(0, 8);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900/70 dtm:border-teal-200/70 dtm:bg-white/85"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold">Самые активные дни</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Среднее дневное движение: {formatTonnes(averageMovement)}</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-100/80 text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Дата</th>
              <th className="px-3 py-2 text-right font-semibold">Приход</th>
              <th className="px-3 py-2 text-right font-semibold">Расход</th>
              <th className="px-3 py-2 text-right font-semibold">Движение</th>
              <th className="px-3 py-2 text-right font-semibold">Нетто</th>
              <th className="px-3 py-2 text-right font-semibold">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {topDays.map((day) => (
              <tr
                key={day.dateIso}
                className="border-t border-zinc-200/70 bg-white/70 text-zinc-700 dark:border-zinc-700/70 dark:bg-zinc-900/45 dark:text-zinc-200"
              >
                <td className="px-3 py-2 font-medium">{formatCompactDate(day.dateIso)}</td>
                <td className="px-3 py-2 text-right text-emerald-700 dark:text-emerald-300">{formatTonnes(day.inbound)}</td>
                <td className="px-3 py-2 text-right text-rose-700 dark:text-rose-300">{formatTonnes(day.outbound)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatTonnes(day.movement)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatSignedTonnes(day.net)}</td>
                <td className="px-3 py-2 text-right">{formatTonnes(day.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.article>
  );
};
