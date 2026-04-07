import * as XLSX from "xlsx";
import type {
  CategoryTotals,
  MonthSummary,
  WarehouseBreakdownItem,
  WarehouseRecord,
} from "@/lib/dashboard-types";

const MONTH_BY_NAME: Record<string, number> = {
  "\u044f\u043d\u0432\u0430\u0440\u044c": 1,
  "\u0444\u0435\u0432\u0440\u0430\u043b\u044c": 2,
  "\u043c\u0430\u0440\u0442": 3,
  "\u0430\u043f\u0440\u0435\u043b\u044c": 4,
  "\u043c\u0430\u0439": 5,
  "\u0438\u044e\u043d\u044c": 6,
  "\u0438\u044e\u043b\u044c": 7,
  "\u0430\u0432\u0433\u0443\u0441\u0442": 8,
  "\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c": 9,
  "\u043e\u043a\u0442\u044f\u0431\u0440\u044c": 10,
  "\u043d\u043e\u044f\u0431\u0440\u044c": 11,
  "\u0434\u0435\u043a\u0430\u0431\u0440\u044c": 12,
};

const EMPTY_TOTALS: CategoryTotals = {
  sibur: 0,
  plant: 0,
  rusvinyl: 0,
  siburClients: 0,
  others: 0,
  total: 0,
};

export const parseCurrency = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const cleaned = value.replace(/[^\d,.\-]/g, "").replace(/\s/g, "");

  if (!cleaned) {
    return 0;
  }

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  const decimalSeparator =
    lastComma >= 0 && lastDot >= 0
      ? lastComma > lastDot
        ? ","
        : "."
      : lastComma >= 0
        ? ","
        : lastDot >= 0
          ? "."
          : null;

  const normalized = (() => {
    if (!decimalSeparator) {
      return cleaned;
    }

    if (decimalSeparator === ",") {
      const hasSingleComma = cleaned.indexOf(",") === lastComma;
      if (!hasSingleComma) {
        return cleaned.replace(/,/g, "");
      }
      const decimalDigits = cleaned.length - lastComma - 1;
      if (decimalDigits > 2) {
        return cleaned.replace(/,/g, "");
      }
      return cleaned.replace(/\./g, "").replace(",", ".");
    }

    const hasSingleDot = cleaned.indexOf(".") === lastDot;
    if (!hasSingleDot) {
      return cleaned.replace(/\./g, "");
    }
    const decimalDigits = cleaned.length - lastDot - 1;
    if (decimalDigits > 2) {
      return cleaned.replace(/\./g, "");
    }
    return cleaned.replace(/,/g, "");
  })();

  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

export const normalizeWarehouseKey = (value: string): string =>
  value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const findSheetByName = (workbook: XLSX.WorkBook, targetNames: string[]): XLSX.WorkSheet | null => {
  for (const sheetName of workbook.SheetNames) {
    const normalizedSheet = sheetName.trim().toLowerCase();
    if (targetNames.some((targetName) => normalizedSheet === targetName.trim().toLowerCase())) {
      return workbook.Sheets[sheetName] ?? null;
    }
  }

  return null;
};

export const parseMonthFromFilename = (
  filename: string,
): Pick<MonthSummary, "id" | "label" | "year" | "month"> => {
  const matched = filename.match(
    /(\u042f\u043d\u0432\u0430\u0440\u044c|\u0424\u0435\u0432\u0440\u0430\u043b\u044c|\u041c\u0430\u0440\u0442|\u0410\u043f\u0440\u0435\u043b\u044c|\u041c\u0430\u0439|\u0418\u044e\u043d\u044c|\u0418\u044e\u043b\u044c|\u0410\u0432\u0433\u0443\u0441\u0442|\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c|\u041e\u043a\u0442\u044f\u0431\u0440\u044c|\u041d\u043e\u044f\u0431\u0440\u044c|\u0414\u0435\u043a\u0430\u0431\u0440\u044c)\s+(\d{4})/i,
  );

  if (!matched) {
    return {
      id: "0-00",
      label: filename,
      year: 0,
      month: 0,
    };
  }

  const monthName = matched[1].toLowerCase();
  const year = Number.parseInt(matched[2], 10);
  const month = MONTH_BY_NAME[monthName] ?? 0;
  const id = `${year}-${String(month).padStart(2, "0")}`;

  return {
    id,
    label: `${matched[1]} ${year}`,
    year,
    month,
  };
};

export const resolveWarehouseBreakdown = (
  warehouseName: string,
  breakdownByWarehouse: Map<string, WarehouseBreakdownItem[]>,
): WarehouseBreakdownItem[] => {
  const normalizedWarehouse = normalizeWarehouseKey(warehouseName);
  if (!normalizedWarehouse) {
    return [];
  }

  const direct = breakdownByWarehouse.get(normalizedWarehouse);
  if (direct) {
    return direct;
  }

  const candidates = Array.from(breakdownByWarehouse.entries())
    .filter(([key]) => key.includes(normalizedWarehouse) || normalizedWarehouse.includes(key))
    .map(([, value]) => value);

  if (candidates.length === 1) {
    return candidates[0];
  }

  return [];
};

export const aggregateCategories = (warehouses: WarehouseRecord[]): CategoryTotals => {
  return warehouses.reduce<CategoryTotals>(
    (acc, warehouse) => ({
      sibur: acc.sibur + warehouse.sibur,
      plant: acc.plant + warehouse.plant,
      rusvinyl: acc.rusvinyl + warehouse.rusvinyl,
      siburClients: acc.siburClients + warehouse.siburClients,
      others: acc.others + warehouse.others,
      total: acc.total + warehouse.total,
    }),
    { ...EMPTY_TOTALS },
  );
};
