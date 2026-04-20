import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type { KeepingPrrData, KeepingPrrDay, KeepingPrrMonth, KeepingPrrWarehouse } from "@/lib/keeping-prr-types";
import { parseMonthFromFilename } from "@/services/dashboard/parsing";

const KEEPING_PRR_ROOT = path.join(process.cwd(), "excel_data", "keeping_prr");
const MAX_TARIFF_PATH = path.join(process.cwd(), "app", "max_tariff.json");

type TariffLimit = {
  max_stock: number;
  max_work: number;
};

type HeaderIndexes = {
  period: number;
  inbound: number;
  outbound: number;
  stock: number;
  inboundCorrection: number | null;
  outboundCorrection: number | null;
};

const normalizeCell = (value: unknown): string => String(value ?? "").trim().toLowerCase();
const normalizeHeaderCell = (value: unknown): string => normalizeCell(value).replace(/\s+/g, " ");
const normalizeWarehouseKey = (value: string): string =>
  normalizeCell(value)
    .replace(/[\s_-]+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
const normalizeWarehouseLabel = (value: string): string => normalizeCell(value).replace(/[\s_-]+/g, " ").trim();

const readTariffLimits = (): Map<string, TariffLimit> => {
  if (!fs.existsSync(MAX_TARIFF_PATH)) {
    return new Map();
  }

  try {
    const raw = fs.readFileSync(MAX_TARIFF_PATH, "utf8");
    const parsed = JSON.parse(raw) as Record<string, Partial<TariffLimit>>;
    const entries = Object.entries(parsed)
      .map(([warehouseName, limit]) => ({
        warehouseKey: normalizeWarehouseKey(warehouseName),
        max_stock: Number(limit.max_stock ?? 0),
        max_work: Number(limit.max_work ?? 0),
      }))
      .filter((limit) => Number.isFinite(limit.max_stock) && Number.isFinite(limit.max_work) && limit.warehouseKey);

    return new Map(
      entries.map((limit) => [
        limit.warehouseKey,
        {
          max_stock: limit.max_stock,
          max_work: limit.max_work,
        },
      ]),
    );
  } catch {
    return new Map();
  }
};

const parseTonnes = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.replace(/[\u00A0\u202F\s]/g, "").replace(/[^\d,.-]/g, "");
  if (!normalized) {
    return 0;
  }

  const commaIndex = normalized.lastIndexOf(",");
  const dotIndex = normalized.lastIndexOf(".");

  if (commaIndex >= 0 && dotIndex >= 0) {
    const commaIsDecimal = commaIndex > dotIndex;
    const prepared = commaIsDecimal
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized.replace(/,/g, "");
    const parsed = Number.parseFloat(prepared);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (commaIndex >= 0) {
    const prepared = normalized.replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(prepared);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDateToIso = (rawValue: unknown): string => {
  if (typeof rawValue === "number") {
    const parsedDate = XLSX.SSF.parse_date_code(rawValue);
    if (parsedDate && parsedDate.y && parsedDate.m && parsedDate.d) {
      return `${parsedDate.y.toString().padStart(4, "0")}-${String(parsedDate.m).padStart(2, "0")}-${String(parsedDate.d).padStart(2, "0")}`;
    }
  }

  const dateLabel = String(rawValue ?? "").trim();
  const matched = dateLabel.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!matched) {
    return "";
  }

  const [, day, month, year] = matched;
  return `${year}-${month}-${day}`;
};

const readRows = (filePath: string): (string | number | null)[][] => {
  const workbookBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(workbookBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;

  if (!sheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });
};

const findHeader = (rows: (string | number | null)[][]): { rowIndex: number; indexes: HeaderIndexes } | null => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const normalized = row.map((cell) => normalizeHeaderCell(cell));

    const period = normalized.findIndex((cell) => cell === "период");
    const inbound = normalized.findIndex((cell) => cell.includes("приход") && !cell.includes("коррект"));
    const outbound = normalized.findIndex((cell) => cell.includes("расход") && !cell.includes("коррект"));
    const stock = normalized.findIndex((cell) => cell.includes("остаток"));
    const inboundCorrection = normalized.findIndex(
      (cell) => cell.includes("приход") && cell.includes("коррект"),
    );
    const outboundCorrection = normalized.findIndex(
      (cell) => cell.includes("расход") && cell.includes("коррект"),
    );

    if (period < 0 || inbound < 0 || outbound < 0 || stock < 0) {
      continue;
    }

    return {
      rowIndex,
      indexes: {
        period,
        inbound,
        outbound,
        stock,
        inboundCorrection: inboundCorrection >= 0 ? inboundCorrection : null,
        outboundCorrection: outboundCorrection >= 0 ? outboundCorrection : null,
      },
    };
  }

  return null;
};

const readDays = (rows: (string | number | null)[][], header: { rowIndex: number; indexes: HeaderIndexes }): KeepingPrrDay[] => {
  const days: KeepingPrrDay[] = [];

  for (const row of rows.slice(header.rowIndex + 1)) {
    const rawPeriodValue = row[header.indexes.period];
    const rawPeriod = String(rawPeriodValue ?? "").trim();
    if (!rawPeriod) {
      continue;
    }

    if (rawPeriod.toLowerCase().startsWith("итого")) {
      break;
    }

    const dateIso = parseDateToIso(rawPeriodValue);
    if (!dateIso) {
      continue;
    }

    const inbound = parseTonnes(row[header.indexes.inbound]);
    const outbound = parseTonnes(row[header.indexes.outbound]);
    const stock = parseTonnes(row[header.indexes.stock]);
    const inboundCorrection =
      header.indexes.inboundCorrection === null ? 0 : parseTonnes(row[header.indexes.inboundCorrection]);
    const outboundCorrection =
      header.indexes.outboundCorrection === null ? 0 : parseTonnes(row[header.indexes.outboundCorrection]);
    const net = inbound - outbound + inboundCorrection - outboundCorrection;
    const movement = inbound + outbound;

    days.push({
      dateIso,
      dateLabel: rawPeriod,
      inbound,
      outbound,
      stock,
      inboundCorrection,
      outboundCorrection,
      net,
      movement,
    });
  }

  return days.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
};

const parseMonthFile = (filePath: string): KeepingPrrMonth | null => {
  const rows = readRows(filePath);
  const header = findHeader(rows);
  if (!header) {
    return null;
  }

  const days = readDays(rows, header);
  if (days.length === 0) {
    return null;
  }

  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  if (!firstDay || !lastDay) {
    return null;
  }

  const monthMeta = parseMonthFromFilename(path.basename(filePath));
  const totalInbound = days.reduce((acc, day) => acc + day.inbound, 0);
  const totalOutbound = days.reduce((acc, day) => acc + day.outbound, 0);
  const totalInboundCorrection = days.reduce((acc, day) => acc + day.inboundCorrection, 0);
  const totalOutboundCorrection = days.reduce((acc, day) => acc + day.outboundCorrection, 0);
  const openingStock = firstDay.stock - firstDay.net;
  const closingStock = lastDay.stock;
  const averageStock = days.reduce((acc, day) => acc + day.stock, 0) / days.length;
  const stocks = days.map((day) => day.stock);
  const minStock = Math.min(...stocks);
  const maxStock = Math.max(...stocks);
  const netFlow = totalInbound - totalOutbound + totalInboundCorrection - totalOutboundCorrection;
  const averageDailyTurnover = days.reduce((acc, day) => acc + day.movement, 0) / days.length;
  const sourcePeriod = String(rows[0]?.[0] ?? "").trim();

  return {
    id: monthMeta.id,
    label: monthMeta.label,
    month: monthMeta.month,
    year: monthMeta.year,
    sourcePeriod,
    days,
    totalInbound,
    totalOutbound,
    totalInboundCorrection,
    totalOutboundCorrection,
    openingStock,
    closingStock,
    averageStock,
    minStock,
    maxStock,
    netFlow,
    averageDailyTurnover,
  };
};

const readWarehouse = (
  warehouseFolderPath: string,
  warehouseName: string,
  tariffLimits: Map<string, TariffLimit>,
): KeepingPrrWarehouse | null => {
  const files = fs
    .readdirSync(warehouseFolderPath)
    .filter((fileName) => fileName.toLowerCase().endsWith(".xlsx"))
    .map((fileName) => path.join(warehouseFolderPath, fileName));

  const months = files
    .map((filePath) => parseMonthFile(filePath))
    .filter((month): month is KeepingPrrMonth => month !== null)
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

  if (months.length === 0) {
    return null;
  }

  const latestMonth = months.at(-1) ?? null;
  const latestDay = latestMonth?.days.at(-1) ?? null;
  const limit = tariffLimits.get(normalizeWarehouseKey(warehouseName)) ?? null;

  return {
    name: warehouseName,
    months,
    limits:
      limit && limit.max_stock > 0 && limit.max_work > 0
        ? {
            maxStock: limit.max_stock,
            maxWork: limit.max_work,
          }
        : null,
    latestSnapshot: latestDay
      ? {
          dateIso: latestDay.dateIso,
          stock: latestDay.stock,
          stockUtilizationPercent:
            limit && limit.max_stock > 0 ? (latestDay.stock / limit.max_stock) * 100 : null,
        }
      : null,
  };
};

const isWarehouseVariant = (baseName: string, candidateName: string): boolean => {
  const base = normalizeWarehouseLabel(baseName);
  const candidate = normalizeWarehouseLabel(candidateName);

  if (!base || !candidate) {
    return false;
  }

  if (base === candidate) {
    return true;
  }

  if (!candidate.startsWith(base)) {
    return false;
  }

  return candidate.charAt(base.length) === " ";
};

const aggregateMonth = (months: KeepingPrrMonth[]): KeepingPrrMonth | null => {
  if (months.length === 0) {
    return null;
  }

  const baseMonth = [...months].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))[0];
  if (!baseMonth) {
    return null;
  }

  const daysByIso = new Map<string, KeepingPrrDay>();

  for (const month of months) {
    for (const day of month.days) {
      const current = daysByIso.get(day.dateIso);
      if (!current) {
        daysByIso.set(day.dateIso, { ...day });
        continue;
      }

      current.inbound += day.inbound;
      current.outbound += day.outbound;
      current.stock += day.stock;
      current.inboundCorrection += day.inboundCorrection;
      current.outboundCorrection += day.outboundCorrection;
      current.net += day.net;
      current.movement += day.movement;
    }
  }

  const days = Array.from(daysByIso.values()).sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  if (days.length === 0) {
    return null;
  }

  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  if (!firstDay || !lastDay) {
    return null;
  }

  const totalInbound = days.reduce((acc, day) => acc + day.inbound, 0);
  const totalOutbound = days.reduce((acc, day) => acc + day.outbound, 0);
  const totalInboundCorrection = days.reduce((acc, day) => acc + day.inboundCorrection, 0);
  const totalOutboundCorrection = days.reduce((acc, day) => acc + day.outboundCorrection, 0);
  const openingStock = firstDay.stock - firstDay.net;
  const closingStock = lastDay.stock;
  const averageStock = days.reduce((acc, day) => acc + day.stock, 0) / days.length;
  const stocks = days.map((day) => day.stock);
  const minStock = Math.min(...stocks);
  const maxStock = Math.max(...stocks);
  const netFlow = totalInbound - totalOutbound + totalInboundCorrection - totalOutboundCorrection;
  const averageDailyTurnover = days.reduce((acc, day) => acc + day.movement, 0) / days.length;

  return {
    id: baseMonth.id,
    label: baseMonth.label,
    month: baseMonth.month,
    year: baseMonth.year,
    sourcePeriod: Array.from(new Set(months.map((month) => month.sourcePeriod).filter(Boolean))).join("; "),
    days,
    totalInbound,
    totalOutbound,
    totalInboundCorrection,
    totalOutboundCorrection,
    openingStock,
    closingStock,
    averageStock,
    minStock,
    maxStock,
    netFlow,
    averageDailyTurnover,
  };
};

const aggregateWarehouses = (
  warehouses: KeepingPrrWarehouse[],
  explicitWarehouseKeys: Set<string>,
): KeepingPrrWarehouse[] => {
  const explicitGroups = new Map<string, { baseName: string; warehouses: KeepingPrrWarehouse[] }>();
  const nonExplicitWarehouses: KeepingPrrWarehouse[] = [];

  for (const warehouse of warehouses) {
    const warehouseKey = normalizeWarehouseKey(warehouse.name);
    if (!explicitWarehouseKeys.has(warehouseKey)) {
      nonExplicitWarehouses.push(warehouse);
      continue;
    }

    const group = explicitGroups.get(warehouseKey);
    if (group) {
      group.warehouses.push(warehouse);
      continue;
    }

    explicitGroups.set(warehouseKey, {
      baseName: warehouse.name,
      warehouses: [warehouse],
    });
  }

  // Attach non-explicit folders (e.g. "<warehouse> Данафлекс") to explicit warehouses from max_tariff.json.
  for (const warehouse of nonExplicitWarehouses) {
    const candidates = Array.from(explicitGroups.values()).filter((group) => isWarehouseVariant(group.baseName, warehouse.name));
    if (candidates.length === 0) {
      continue;
    }

    candidates.sort((a, b) => normalizeWarehouseLabel(b.baseName).length - normalizeWarehouseLabel(a.baseName).length);
    candidates[0]?.warehouses.push(warehouse);
  }

  const attachedNonExplicitKeys = new Set(
    Array.from(explicitGroups.values())
      .flatMap((group) => group.warehouses)
      .map((warehouse) => warehouse.name),
  );
  const remainingNonExplicit = nonExplicitWarehouses.filter((warehouse) => !attachedNonExplicitKeys.has(warehouse.name));

  const grouped: { baseName: string; warehouses: KeepingPrrWarehouse[] }[] = [...explicitGroups.values()];
  const sortedRemainingNonExplicit = [...remainingNonExplicit].sort((a, b) => {
    const lengthDiff = normalizeWarehouseLabel(a.name).length - normalizeWarehouseLabel(b.name).length;
    return lengthDiff !== 0 ? lengthDiff : a.name.localeCompare(b.name, "ru");
  });

  for (const warehouse of sortedRemainingNonExplicit) {
    const group = grouped.find((entry) => !explicitWarehouseKeys.has(normalizeWarehouseKey(entry.baseName)) && isWarehouseVariant(entry.baseName, warehouse.name));
    if (group) {
      group.warehouses.push(warehouse);
      continue;
    }

    grouped.push({
      baseName: warehouse.name,
      warehouses: [warehouse],
    });
  }

  return grouped
    .map((group): KeepingPrrWarehouse | null => {
      const monthsById = new Map<string, KeepingPrrMonth[]>();

      for (const warehouse of group.warehouses) {
        for (const month of warehouse.months) {
          const current = monthsById.get(month.id) ?? [];
          current.push(month);
          monthsById.set(month.id, current);
        }
      }

      const months = Array.from(monthsById.values())
        .map((monthGroup) => aggregateMonth(monthGroup))
        .filter((month): month is KeepingPrrMonth => month !== null)
        .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

      if (months.length === 0) {
        return null;
      }

      const maxStock = group.warehouses.reduce((acc, warehouse) => acc + (warehouse.limits?.maxStock ?? 0), 0);
      const maxWork = group.warehouses.reduce((acc, warehouse) => acc + (warehouse.limits?.maxWork ?? 0), 0);
      const latestMonth = months.at(-1) ?? null;
      const latestDay = latestMonth?.days.at(-1) ?? null;

      return {
        name: group.baseName,
        months,
        limits:
          maxStock > 0 && maxWork > 0
            ? {
                maxStock,
                maxWork,
              }
            : null,
        latestSnapshot: latestDay
          ? {
              dateIso: latestDay.dateIso,
              stock: latestDay.stock,
              stockUtilizationPercent: maxStock > 0 ? (latestDay.stock / maxStock) * 100 : null,
            }
          : null,
      };
    })
    .filter((warehouse): warehouse is KeepingPrrWarehouse => warehouse !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
};

export const getKeepingPrrData = async (): Promise<KeepingPrrData> => {
  if (!fs.existsSync(KEEPING_PRR_ROOT)) {
    return {
      warehouses: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const tariffLimits = readTariffLimits();

  const warehouseFolders = fs
    .readdirSync(KEEPING_PRR_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readWarehouse(path.join(KEEPING_PRR_ROOT, entry.name), entry.name, tariffLimits))
    .filter((warehouse): warehouse is KeepingPrrWarehouse => warehouse !== null);
  const warehouses = aggregateWarehouses(warehouseFolders, new Set(tariffLimits.keys()));

  return {
    warehouses,
    generatedAt: new Date().toISOString(),
  };
};
