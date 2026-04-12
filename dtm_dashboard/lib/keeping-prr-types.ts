export type KeepingPrrDay = {
  dateIso: string;
  dateLabel: string;
  inbound: number;
  outbound: number;
  stock: number;
  inboundCorrection: number;
  outboundCorrection: number;
  net: number;
  movement: number;
};

export type KeepingPrrMonth = {
  id: string;
  label: string;
  month: number;
  year: number;
  sourcePeriod: string;
  days: KeepingPrrDay[];
  totalInbound: number;
  totalOutbound: number;
  totalInboundCorrection: number;
  totalOutboundCorrection: number;
  openingStock: number;
  closingStock: number;
  averageStock: number;
  minStock: number;
  maxStock: number;
  netFlow: number;
  averageDailyTurnover: number;
};

export type KeepingPrrWarehouse = {
  name: string;
  months: KeepingPrrMonth[];
};

export type KeepingPrrData = {
  warehouses: KeepingPrrWarehouse[];
  generatedAt: string;
};
