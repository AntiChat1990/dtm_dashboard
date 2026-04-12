import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type { KeepingPrrData, KeepingPrrDay, KeepingPrrMonth, KeepingPrrWarehouse } from "@/lib/keeping-prr-types";
import { parseMonthFromFilename } from "@/services/dashboard/parsing";

const KEEPING_PRR_ROOT = path.join(process.cwd(), "excel_data", "keeping_prr");

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

const readWarehouse = (warehouseFolderPath: string, warehouseName: string): KeepingPrrWarehouse | null => {
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

  return {
    name: warehouseName,
    months,
  };
};

export const getKeepingPrrData = async (): Promise<KeepingPrrData> => {
  if (!fs.existsSync(KEEPING_PRR_ROOT)) {
    return {
      warehouses: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const warehouses = fs
    .readdirSync(KEEPING_PRR_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readWarehouse(path.join(KEEPING_PRR_ROOT, entry.name), entry.name))
    .filter((warehouse): warehouse is KeepingPrrWarehouse => warehouse !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return {
    warehouses,
    generatedAt: new Date().toISOString(),
  };
};
