import type { KeepingPrrData, KeepingPrrMonth, KeepingPrrWarehouse } from "@/lib/keeping-prr-types";

export type KeepingPrrDashboardProps = {
  data: KeepingPrrData;
};

export type KeepingPrrHeaderProps = {
  generatedAt: string;
  monthOptions: KeepingPrrMonth[];
  onMonthChange: (monthId: string) => void;
  onWarehouseChange: (warehouse: string) => void;
  selectedMonth: KeepingPrrMonth;
  selectedWarehouse: string;
  warehouseOptions: KeepingPrrWarehouse[];
};

export type KeepingPrrOverviewCardsProps = {
  warehouse: KeepingPrrWarehouse;
  month: KeepingPrrMonth;
  previousMonth: KeepingPrrMonth | null;
};

export type KeepingPrrMonthlyTrendProps = {
  months: KeepingPrrMonth[];
  selectedMonthId: string;
};

export type KeepingPrrDailyFlowProps = {
  month: KeepingPrrMonth;
};

export type KeepingPrrActivityTableProps = {
  month: KeepingPrrMonth;
};
