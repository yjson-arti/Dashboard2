
export interface TrendDataPoint {
  day: string;
  current: number;
  comparison: number;
}

export interface MetricCell {
  value: string; // e.g., "$ 5.2M"
  change: string; // e.g., "-13.33%"
  changeLabel: string; // e.g., "MoM", "WoW"
  isPositive: boolean;
}

export interface PeriodRowData {
  period: string; // WTD, MTD, QTD, YTD
  periodLabel: string;
  // Data is flattened: [Total_Spend, Total_NTB, Total_Rev, Spon_NB_Spend, ..., DSP_Rev]
  cells: MetricCell[]; 
}

// Configuration types for the headers
export interface HeaderGroup {
  title: string;
  span: number;
  subGroups?: HeaderGroup[];
}
