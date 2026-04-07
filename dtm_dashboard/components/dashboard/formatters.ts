import type { CategoryCard, CategoryKey, FormatAmount } from "@/components/dashboard/types";
import type { MonthSummary } from "@/lib/dashboard-types";

export const toPercent = (value: number): string => `${Math.round(value)}%`;

export const formatDeltaPercent = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const formatSharePercent = (value: number): string => `${value.toFixed(1)}%`;

export const formatRubRate = (value: number): string =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);

export const formatSignedAmount = (value: number, formatAmount: FormatAmount): string =>
  `${value >= 0 ? "+" : "−"}${formatAmount(Math.abs(value))}`;

export const getCategoryCards = (selectedMonth: MonthSummary): CategoryCard[] => {
  const categories: Array<{ key: CategoryKey; label: string }> = [
    { key: "sibur", label: "Сибур" },
    { key: "plant", label: "Завод" },
    { key: "rusvinyl", label: "Русвинил" },
    { key: "siburClients", label: "Клиенты Сибура" },
    { key: "others", label: "Остальные" },
  ];

  return categories.map(({ key, label }) => ({
    key,
    label,
    value: selectedMonth.categoryTotals[key],
  }));
};

export const getDeltaBadgeClass = (isPositive: boolean): string =>
  isPositive
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
