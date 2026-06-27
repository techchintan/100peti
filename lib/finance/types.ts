import type {PortfolioSummary} from "@/lib/wealth";

export type DashboardTotals = {
  income: number;
  expense: number;
  lentMoney: number;
  cash: number;
};

export type CashNote = {
  _id: string;
  denomination: number;
  bundles100?: number;
  bundles50?: number;
  bundles100Count: number;
  looseNotes?: number;
  quantity: number;
  lastCounted?: string;
  notes?: string;
  totalValue: number;
};

export type TradingInvestment = {
  _id: string;
  name: string;
  platform?: string;
  assetType?: string;
  status?: string;
  purchaseDate?: string;
  investedAmount: number;
  currentValue: number;
  notes?: string;
  gainLoss: number;
};

export type GoldWealthItem = {
  _id: string;
  itemName: string;
  weightGrams: number;
  purity?: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice: number;
  currentValue: number;
  notes?: string;
  gainLoss: number;
};

export type NotesPortfolioSummary = PortfolioSummary & {
  notesBundles100?: number;
  notesBundles50?: number;
};

export type RokdaTransactionLike = {
  transactionType: string;
  transactionAmount: number;
  isBorrow?: boolean | null;
  transactionDescription?: string | null;
};
