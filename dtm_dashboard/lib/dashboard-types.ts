export type CategoryTotals = {
  sibur: number;
  plant: number;
  rusvinyl: number;
  siburClients: number;
  others: number;
  total: number;
};

export type WarehouseRecord = CategoryTotals & {
  warehouse: string;
  breakdown: WarehouseBreakdownItem[];
};

export type WarehouseBreakdownItem = {
  source: string;
  amount: number;
};

export type MonthSummary = {
  id: string;
  label: string;
  year: number;
  month: number;
  totalRevenue: number;
  warehouses: WarehouseRecord[];
  categoryTotals: CategoryTotals;
};

export type DashboardData = {
  months: MonthSummary[];
  currencyRates: CurrencyRate[];
  generatedAt: string;
};

export type CurrencyCode = "RUB" | "USD" | "EUR" | "CNY" | "BTC";

export type CurrencyRate = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rubRate: number;
  source: string;
  updatedAt: string;
};
