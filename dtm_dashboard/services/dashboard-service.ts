import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type {
  CategoryTotals,
  CurrencyCode,
  CurrencyRate,
  DashboardData,
  MonthSummary,
  WarehouseBreakdownItem,
  WarehouseRecord,
} from "@/lib/dashboard-types";

const EXCEL_FOLDER = path.join(process.cwd(), "excel_data");

const MONTH_BY_NAME: Record<string, number> = {
  январь: 1,
  февраль: 2,
  март: 3,
  апрель: 4,
  май: 5,
  июнь: 6,
  июль: 7,
  август: 8,
  сентябрь: 9,
  октябрь: 10,
  ноябрь: 11,
  декабрь: 12,
};

const EMPTY_TOTALS: CategoryTotals = {
  sibur: 0,
  plant: 0,
  rusvinyl: 0,
  siburClients: 0,
  others: 0,
  total: 0,
};

const CURRENCY_META: Record<CurrencyCode, Pick<CurrencyRate, "name" | "symbol">> = {
  RUB: { name: "Рубль", symbol: "₽" },
  USD: { name: "Доллар", symbol: "$" },
  EUR: { name: "Евро", symbol: "€" },
  CNY: { name: "Юань", symbol: "¥" },
  BTC: { name: "Биткоин", symbol: "₿" },
};

const FALLBACK_RUB_RATES: Record<Exclude<CurrencyCode, "RUB">, number> = {
  USD: 80,
  EUR: 90,
  CNY: 11,
  BTC: 5500000,
};

const getCurrencyRates = async (): Promise<CurrencyRate[]> => {
  const defaults: CurrencyRate[] = [
    {
      code: "RUB",
      name: CURRENCY_META.RUB.name,
      symbol: CURRENCY_META.RUB.symbol,
      rubRate: 1,
      source: "Локально",
      updatedAt: new Date().toISOString(),
    },
    {
      code: "USD",
      name: CURRENCY_META.USD.name,
      symbol: CURRENCY_META.USD.symbol,
      rubRate: FALLBACK_RUB_RATES.USD,
      source: "Fallback",
      updatedAt: new Date().toISOString(),
    },
    {
      code: "EUR",
      name: CURRENCY_META.EUR.name,
      symbol: CURRENCY_META.EUR.symbol,
      rubRate: FALLBACK_RUB_RATES.EUR,
      source: "Fallback",
      updatedAt: new Date().toISOString(),
    },
    {
      code: "CNY",
      name: CURRENCY_META.CNY.name,
      symbol: CURRENCY_META.CNY.symbol,
      rubRate: FALLBACK_RUB_RATES.CNY,
      source: "Fallback",
      updatedAt: new Date().toISOString(),
    },
    {
      code: "BTC",
      name: CURRENCY_META.BTC.name,
      symbol: CURRENCY_META.BTC.symbol,
      rubRate: FALLBACK_RUB_RATES.BTC,
      source: "Fallback",
      updatedAt: new Date().toISOString(),
    },
  ];

  try {
    const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=RUB", {
      next: { revalidate: 600 },
    });

    if (coinbaseResponse.ok) {
      const coinbaseJson = (await coinbaseResponse.json()) as {
        data?: {
          currency?: string;
          rates?: Partial<Record<CurrencyCode, string>>;
        };
      };

      const rates = coinbaseJson.data?.rates;
      if (coinbaseJson.data?.currency === "RUB" && rates) {
        const toRub = (code: Exclude<CurrencyCode, "RUB">): number => {
          const raw = rates[code];
          const parsed = typeof raw === "string" ? Number.parseFloat(raw) : Number.NaN;
          if (!Number.isFinite(parsed) || parsed <= 0) {
            return FALLBACK_RUB_RATES[code];
          }
          return 1 / parsed;
        };

        const updatedAt = new Date().toISOString();

        return [
          {
            code: "RUB",
            name: CURRENCY_META.RUB.name,
            symbol: CURRENCY_META.RUB.symbol,
            rubRate: 1,
            source: "api.coinbase.com",
            updatedAt,
          },
          {
            code: "USD",
            name: CURRENCY_META.USD.name,
            symbol: CURRENCY_META.USD.symbol,
            rubRate: toRub("USD"),
            source: "api.coinbase.com",
            updatedAt,
          },
          {
            code: "EUR",
            name: CURRENCY_META.EUR.name,
            symbol: CURRENCY_META.EUR.symbol,
            rubRate: toRub("EUR"),
            source: "api.coinbase.com",
            updatedAt,
          },
          {
            code: "CNY",
            name: CURRENCY_META.CNY.name,
            symbol: CURRENCY_META.CNY.symbol,
            rubRate: toRub("CNY"),
            source: "api.coinbase.com",
            updatedAt,
          },
          {
            code: "BTC",
            name: CURRENCY_META.BTC.name,
            symbol: CURRENCY_META.BTC.symbol,
            rubRate: toRub("BTC"),
            source: "api.coinbase.com",
            updatedAt,
          },
        ];
      }
    }

    const fallbackResponse = await fetch("https://open.er-api.com/v6/latest/RUB", {
      next: { revalidate: 600 },
    });

    if (!fallbackResponse.ok) {
      return defaults;
    }

    const fallbackJson = (await fallbackResponse.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Partial<Record<CurrencyCode, number>>;
    };

    if (fallbackJson.result !== "success" || !fallbackJson.rates) {
      return defaults;
    }

    const toRubFromFallback = (code: Exclude<CurrencyCode, "RUB">): number => {
      const direct = fallbackJson.rates?.[code];
      if (!direct || direct <= 0) {
        return FALLBACK_RUB_RATES[code];
      }
      return 1 / direct;
    };

    const updatedAt = fallbackJson.time_last_update_utc
      ? new Date(fallbackJson.time_last_update_utc).toISOString()
      : new Date().toISOString();

    return [
      {
        code: "RUB",
        name: CURRENCY_META.RUB.name,
        symbol: CURRENCY_META.RUB.symbol,
        rubRate: 1,
        source: "open.er-api.com",
        updatedAt,
      },
      {
        code: "USD",
        name: CURRENCY_META.USD.name,
        symbol: CURRENCY_META.USD.symbol,
        rubRate: toRubFromFallback("USD"),
        source: "open.er-api.com",
        updatedAt,
      },
      {
        code: "EUR",
        name: CURRENCY_META.EUR.name,
        symbol: CURRENCY_META.EUR.symbol,
        rubRate: toRubFromFallback("EUR"),
        source: "open.er-api.com",
        updatedAt,
      },
      {
        code: "CNY",
        name: CURRENCY_META.CNY.name,
        symbol: CURRENCY_META.CNY.symbol,
        rubRate: toRubFromFallback("CNY"),
        source: "open.er-api.com",
        updatedAt,
      },
      {
        code: "BTC",
        name: CURRENCY_META.BTC.name,
        symbol: CURRENCY_META.BTC.symbol,
        rubRate: toRubFromFallback("BTC"),
        source: "open.er-api.com",
        updatedAt,
      },
    ];
  } catch {
    return defaults;
  }
};

const parseCurrency = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const cleaned = value
    .replace(/[^\d,.\-]/g, "")
    .replace(/\s/g, "");

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

const normalizeWarehouseKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]/gi, "");

const findSheetByName = (workbook: XLSX.WorkBook, targetNames: string[]): XLSX.WorkSheet | null => {
  for (const sheetName of workbook.SheetNames) {
    const normalizedSheet = sheetName.trim().toLowerCase();
    if (targetNames.some((targetName) => normalizedSheet === targetName.trim().toLowerCase())) {
      return workbook.Sheets[sheetName] ?? null;
    }
  }
  return null;
};

const parseMonthFromFilename = (filename: string): Pick<
  MonthSummary,
  "id" | "label" | "year" | "month"
> => {
  const matched = filename.match(
    /(Январь|Февраль|Март|Апрель|Май|Июнь|Июль|Август|Сентябрь|Октябрь|Ноябрь|Декабрь)\s+(\d{4})/i,
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

const readSummaryRows = (workbook: XLSX.WorkBook): WarehouseRecord[] => {
  const summarySheet = findSheetByName(workbook, ["ИТОГО"]);
  if (!summarySheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(summarySheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  const headerIndex = rows.findIndex((row) => {
    const first = String(row[0] ?? "").trim().toLowerCase();
    return first === "склад";
  });

  if (headerIndex < 0) {
    return [];
  }

  const result: WarehouseRecord[] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const warehouse = String(row[0] ?? "").trim();
    if (!warehouse) {
      break;
    }

    if (warehouse.toLowerCase() === "итого") {
      break;
    }

    const parsedRow: WarehouseRecord = {
      warehouse,
      sibur: parseCurrency(row[1]),
      plant: parseCurrency(row[2]),
      rusvinyl: parseCurrency(row[3]),
      siburClients: parseCurrency(row[4]),
      others: parseCurrency(row[5]),
      total: parseCurrency(row[6]),
      breakdown: [],
    };

    if (parsedRow.total <= 0) {
      continue;
    }

    result.push(parsedRow);
  }

  return result;
};

const readWarehouseBreakdown = (workbook: XLSX.WorkBook): Map<string, WarehouseBreakdownItem[]> => {
  const summarySheet = findSheetByName(workbook, ["Сводка"]);
  if (!summarySheet) {
    return new Map<string, WarehouseBreakdownItem[]>();
  }

  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(summarySheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  const grouped = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const source = String(row[0] ?? "").trim();
    const warehouse = String(row[1] ?? "").trim();
    const amount = parseCurrency(row[2]);

    if (!source || !warehouse || amount <= 0) {
      continue;
    }

    const warehouseKey = normalizeWarehouseKey(warehouse);
    if (!warehouseKey) {
      continue;
    }

    const sourceTotals = grouped.get(warehouseKey) ?? new Map<string, number>();
    sourceTotals.set(source, (sourceTotals.get(source) ?? 0) + amount);
    grouped.set(warehouseKey, sourceTotals);
  }

  const result = new Map<string, WarehouseBreakdownItem[]>();
  for (const [warehouseKey, sourceTotals] of grouped.entries()) {
    const breakdown = Array.from(sourceTotals.entries())
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount);

    if (breakdown.length > 0) {
      result.set(warehouseKey, breakdown);
    }
  }

  return result;
};

const resolveWarehouseBreakdown = (
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

const aggregateCategories = (warehouses: WarehouseRecord[]): CategoryTotals => {
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

const parseWorkbook = (filePath: string): MonthSummary => {
  const workbookBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(workbookBuffer, { type: "buffer" });
  const { id, label, month, year } = parseMonthFromFilename(path.basename(filePath));
  const warehouseBreakdown = readWarehouseBreakdown(workbook);
  const warehouses = readSummaryRows(workbook)
    .map((warehouse) => ({
      ...warehouse,
      breakdown: resolveWarehouseBreakdown(warehouse.warehouse, warehouseBreakdown),
    }))
    .sort((a, b) => b.total - a.total);
  const categories = aggregateCategories(warehouses);

  const totalFromA1 = (() => {
    const summarySheet = findSheetByName(workbook, ["ИТОГО"]);
    if (!summarySheet) {
      return 0;
    }
    const row = XLSX.utils.sheet_to_json<(string | number | null)[]>(summarySheet, {
      header: 1,
      defval: null,
      raw: false,
      range: 0,
    })[0];
    return parseCurrency(row?.[0]);
  })();

  return {
    id,
    label,
    month,
    year,
    warehouses,
    categoryTotals: categories,
    totalRevenue: totalFromA1 > 0 ? totalFromA1 : categories.total,
  };
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const currencyRates = await getCurrencyRates();

  if (!fs.existsSync(EXCEL_FOLDER)) {
    return {
      months: [],
      currencyRates,
      generatedAt: new Date().toISOString(),
    };
  }

  const files = fs
    .readdirSync(EXCEL_FOLDER)
    .filter((file) => file.endsWith(".xlsx"))
    .map((file) => path.join(EXCEL_FOLDER, file));

  const months = files
    .map((filePath) => parseWorkbook(filePath))
    .sort((a, b) => (a.year - b.year !== 0 ? a.year - b.year : a.month - b.month));

  return {
    months,
    currencyRates,
    generatedAt: new Date().toISOString(),
  };
};
