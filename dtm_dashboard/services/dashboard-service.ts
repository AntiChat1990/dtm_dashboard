import fs from "node:fs";
import path from "node:path";
import type { DashboardData } from "@/lib/dashboard-types";
import { getCurrencyRates } from "@/services/dashboard/currency-rates";
import { parseWorkbook } from "@/services/dashboard/excel-parser";

const EXCEL_FOLDER = path.join(process.cwd(), "excel_data");

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
