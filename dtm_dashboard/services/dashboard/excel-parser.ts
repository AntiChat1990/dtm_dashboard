import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import type { MonthSummary, WarehouseBreakdownItem, WarehouseRecord } from "@/lib/dashboard-types";
import {
  aggregateCategories,
  findSheetByName,
  normalizeWarehouseKey,
  parseCurrency,
  parseMonthFromFilename,
  resolveWarehouseBreakdown,
} from "@/services/dashboard/parsing";

const TOTAL_SHEET_NAME = "\u0418\u0422\u041e\u0413\u041e";
const SUMMARY_SHEET_NAME = "\u0421\u0432\u043e\u0434\u043a\u0430";
const WAREHOUSE_HEADER = "\u0441\u043a\u043b\u0430\u0434";
const TOTAL_ROW_LABEL = "\u0438\u0442\u043e\u0433\u043e";

const readSummaryRows = (workbook: XLSX.WorkBook): WarehouseRecord[] => {
  const summarySheet = findSheetByName(workbook, [TOTAL_SHEET_NAME]);
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
    return first === WAREHOUSE_HEADER;
  });

  if (headerIndex < 0) {
    return [];
  }

  const result: WarehouseRecord[] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const warehouse = String(row[0] ?? "").trim();
    if (!warehouse || warehouse.toLowerCase() === TOTAL_ROW_LABEL) {
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
  const summarySheet = findSheetByName(workbook, [SUMMARY_SHEET_NAME]);
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

const readTotalRevenue = (workbook: XLSX.WorkBook): number => {
  const summarySheet = findSheetByName(workbook, [TOTAL_SHEET_NAME]);
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
};

export const parseWorkbook = (filePath: string): MonthSummary => {
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
  const totalRevenue = readTotalRevenue(workbook);

  return {
    id,
    label,
    month,
    year,
    warehouses,
    categoryTotals: categories,
    totalRevenue: totalRevenue > 0 ? totalRevenue : categories.total,
  };
};
