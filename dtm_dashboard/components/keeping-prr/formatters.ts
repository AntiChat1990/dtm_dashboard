export const formatTonnes = (value: number): string =>
  `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)} т`;

export const formatSignedTonnes = (value: number): string => `${value >= 0 ? "+" : "−"}${formatTonnes(Math.abs(value))}`;

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export const formatCompactDate = (dateIso: string): string => {
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
};
