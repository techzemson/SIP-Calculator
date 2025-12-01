export enum Currency {
  USD = 'USD',
  INR = 'INR',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  AUD = 'AUD',
  CAD = 'CAD',
  SGD = 'SGD'
}

export interface SIPInputs {
  monthlyInvestment: number;
  expectedReturn: number; // Annual %
  timePeriod: number; // Years
  stepUpPercentage: number; // Annual increase %
  inflationRate: number; // Annual %
  initialLumpsum: number;
  expenseRatio: number; // Annual %
  taxRate: number; // Capital Gains Tax %
  targetAmount: number; // Goal amount
}

export interface YearlyBreakdown {
  year: number;
  investedAmount: number;
  interestEarned: number;
  totalValue: number;
  monthlyInvestment: number;
}

export interface CalculationResult {
  totalInvested: number;
  totalReturns: number;
  totalValue: number;
  postTaxValue: number;
  realValue: number; // Inflation adjusted
  breakdown: YearlyBreakdown[];
  costOfDelay: number; // Loss if delayed by 1 year
  milestones: { label: string; year: number | null }[];
  absoluteReturnPercentage: number;
  wealthMultiplier: number;
  goalAchievedPercentage: number;
}

export interface ChartDataPoint {
  year: string;
  Invested: number;
  Wealth: number;
}