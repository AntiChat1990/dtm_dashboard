import type {
  CurrencyRate,
  MonthSummary,
  WarehouseBreakdownItem,
  WarehouseRecord,
} from "@/lib/dashboard-types";

export type CategoryKey = "sibur" | "plant" | "rusvinyl" | "siburClients" | "others";

export type FormatAmount = (amountRub: number) => string;

export type CategoryCard = {
  key: CategoryKey;
  label: string;
  value: number;
};

export type DashboardHeaderProps = {
  currencyMenuOpen: boolean;
  currencyMenuRef: React.RefObject<HTMLDivElement | null>;
  currencyRates: CurrencyRate[];
  generatedAt: string;
  monthMenuOpen: boolean;
  monthMenuRef: React.RefObject<HTMLDivElement | null>;
  monthsForTrend: MonthSummary[];
  onCurrencyMenuToggle: () => void;
  onCurrencySelect: (code: CurrencyRate["code"]) => void;
  onMonthMenuToggle: () => void;
  onMonthSelect: (monthId: string) => void;
  selectedCurrency: CurrencyRate["code"];
  selectedCurrencyMeta: CurrencyRate;
  selectedMonth: MonthSummary;
};

export type RevenueStructureProps = {
  categoryCards: CategoryCard[];
  formatAmount: FormatAmount;
  previousMonth: MonthSummary | null;
  selectedMonth: MonthSummary;
};

export type RevenueTrendProps = {
  formatAmount: FormatAmount;
  monthsForTrend: MonthSummary[];
  peakMonthRevenue: number;
  selectedMonthId: string;
};

export type SummaryCardsProps = {
  averageRevenuePerWarehouse: number;
  formatAmount: FormatAmount;
  peakMonthRevenue: number;
  selectedMonth: MonthSummary;
  topWarehousesCount: number;
};

export type WarehouseBreakdownProps = {
  breakdown: WarehouseBreakdownItem[];
  formatAmount: FormatAmount;
  total: number;
  warehouseName: string;
};

export type WarehouseListProps = {
  expandedWarehouse: string | null;
  formatAmount: FormatAmount;
  onWarehouseToggle: (warehouseName: string, hasBreakdown: boolean) => void;
  previousMonth: MonthSummary | null;
  selectedMonth: MonthSummary;
  warehouses: WarehouseRecord[];
};
