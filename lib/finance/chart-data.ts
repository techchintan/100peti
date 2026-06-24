import type {ROKDA_TRANSACTIONSResult} from "@/sanity.types";
import {getGoldGain, getTradingGain, type PortfolioSummary} from "@/lib/wealth";

import type {CashNote, GoldWealthItem, TradingInvestment} from "./types";

export type CashFlowPeriod = {
  label: string;
  sortKey: string;
  income: number;
  expense: number;
  lentMoney: number;
  netCash: number;
};

export type WealthSlice = {
  key: string;
  label: string;
  value: number;
};

export type LentByPerson = {
  name: string;
  amount: number;
};

export type SavingsRatePeriod = {
  label: string;
  sortKey: string;
  savingsRate: number;
  income: number;
  netCash: number;
};

export type DenominationBreakdown = {
  denomination: number;
  label: string;
  quantity: number;
  value: number;
};

export type HoldingPnL = {
  id: string;
  name: string;
  invested: number;
  current: number;
  gain: number;
};

export type InvestmentCategory = {
  key: string;
  label: string;
  invested: number;
  value: number;
  gain: number;
};

export type DashboardChartData = {
  wealthBreakdown: WealthSlice[];
  investmentCategories: InvestmentCategory[];
  lentByPerson: LentByPerson[];
  savingsRate: SavingsRatePeriod[];
  notesByDenomination: DenominationBreakdown[];
  tradingHoldings: HoldingPnL[];
  goldHoldings: HoldingPnL[];
};

type TransactionLike = {
  transactionDate: string;
  transactionType: string;
  transactionAmount: number;
  isBorrow?: boolean | null;
};

function withNetCash(period: Omit<CashFlowPeriod, "netCash">): CashFlowPeriod {
  return {
    ...period,
    netCash: period.income - period.expense - period.lentMoney,
  };
}

function upsertCashFlowPeriod(
  map: Map<string, CashFlowPeriod>,
  sortKey: string,
  label: string,
  transaction: TransactionLike,
) {
  const existing = map.get(sortKey) ?? {
    label,
    sortKey,
    income: 0,
    expense: 0,
    lentMoney: 0,
    netCash: 0,
  };

  if (transaction.transactionType === "income") {
    existing.income += transaction.transactionAmount;
  } else if (transaction.transactionType === "expense") {
    if (transaction.isBorrow) {
      existing.lentMoney += transaction.transactionAmount;
    } else {
      existing.expense += transaction.transactionAmount;
    }
  }

  map.set(sortKey, withNetCash(existing));
}

export function buildYearlyCashFlow(transactions?: TransactionLike[] | null): CashFlowPeriod[] {
  const map = new Map<string, CashFlowPeriod>();

  for (const transaction of transactions ?? []) {
    const year = new Date(transaction.transactionDate).getFullYear();
    const sortKey = String(year);
    upsertCashFlowPeriod(map, sortKey, sortKey, transaction);
  }

  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function buildMonthlyCashFlow(transactions?: TransactionLike[] | null): CashFlowPeriod[] {
  const map = new Map<string, CashFlowPeriod>();

  for (const transaction of transactions ?? []) {
    const date = new Date(transaction.transactionDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const sortKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-IN", {month: "short", year: "numeric"});
    upsertCashFlowPeriod(map, sortKey, label, transaction);
  }

  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function buildWealthBreakdown(wealth: PortfolioSummary): WealthSlice[] {
  return [
    {key: "cash", label: "Cash at Home", value: wealth.cash},
    {key: "notes", label: "Physical Notes", value: wealth.notesValue},
    {key: "trading", label: "Trading & Investment", value: wealth.tradingValue},
    {key: "gold", label: "Gold Wealth", value: wealth.goldValue},
  ].filter((slice) => slice.value > 0);
}

export function buildInvestmentCategories(wealth: PortfolioSummary): InvestmentCategory[] {
  return [
    {
      key: "trading",
      label: "Trading",
      invested: wealth.tradingInvested,
      value: wealth.tradingValue,
      gain: getTradingGain(wealth),
    },
    {
      key: "gold",
      label: "Gold",
      invested: wealth.goldPurchase,
      value: wealth.goldValue,
      gain: getGoldGain(wealth),
    },
  ].filter((row) => row.invested > 0 || row.value > 0);
}

export function buildLentByPerson(
  transactions?: ROKDA_TRANSACTIONSResult | null,
): LentByPerson[] {
  const map = new Map<string, number>();

  for (const transaction of transactions ?? []) {
    if (transaction.transactionType !== "expense" || !transaction.isBorrow) continue;
    const name = transaction.borrower?.name?.trim() || "Unknown";
    map.set(name, (map.get(name) ?? 0) + transaction.transactionAmount);
  }

  return [...map.entries()]
    .map(([name, amount]) => ({name, amount}))
    .sort((a, b) => b.amount - a.amount);
}

export function buildSavingsRate(yearlyData: CashFlowPeriod[]): SavingsRatePeriod[] {
  return yearlyData.map((period) => ({
    label: period.label,
    sortKey: period.sortKey,
    income: period.income,
    netCash: period.netCash,
    savingsRate: period.income > 0 ? (period.netCash / period.income) * 100 : 0,
  }));
}

export function buildNotesByDenomination(notes?: CashNote[] | null): DenominationBreakdown[] {
  const map = new Map<number, DenominationBreakdown>();

  for (const note of notes ?? []) {
    const existing = map.get(note.denomination) ?? {
      denomination: note.denomination,
      label: `₹${note.denomination}`,
      quantity: 0,
      value: 0,
    };
    existing.quantity += note.quantity ?? 0;
    existing.value += note.totalValue ?? 0;
    map.set(note.denomination, existing);
  }

  return [...map.values()].sort((a, b) => b.denomination - a.denomination);
}

export function buildTradingHoldings(rows?: TradingInvestment[] | null): HoldingPnL[] {
  return (rows ?? [])
    .filter((row) => row.status !== "sold")
    .filter((row) => row.investedAmount > 0 || row.currentValue > 0)
    .map((row) => ({
      id: row._id,
      name: row.name.trim() || "Unnamed",
      invested: row.investedAmount,
      current: row.currentValue,
      gain: row.gainLoss ?? row.currentValue - row.investedAmount,
    }))
    .sort((a, b) => b.current - a.current);
}

export function buildGoldHoldings(rows?: GoldWealthItem[] | null): HoldingPnL[] {
  return (rows ?? [])
    .filter((row) => row.purchasePrice > 0 || row.currentValue > 0)
    .map((row) => ({
      id: row._id,
      name: row.itemName.trim() || "Unnamed",
      invested: row.purchasePrice,
      current: row.currentValue,
      gain: row.gainLoss ?? row.currentValue - row.purchasePrice,
    }))
    .sort((a, b) => b.current - a.current);
}

export function buildDashboardChartData({
  wealth,
  transactions,
  yearlyCashFlow,
  cashNotes,
  trading,
  gold,
}: {
  wealth: PortfolioSummary;
  transactions?: ROKDA_TRANSACTIONSResult | null;
  yearlyCashFlow: CashFlowPeriod[];
  cashNotes?: CashNote[] | null;
  trading?: TradingInvestment[] | null;
  gold?: GoldWealthItem[] | null;
}): DashboardChartData {
  return {
    wealthBreakdown: buildWealthBreakdown(wealth),
    investmentCategories: buildInvestmentCategories(wealth),
    lentByPerson: buildLentByPerson(transactions),
    savingsRate: buildSavingsRate(yearlyCashFlow),
    notesByDenomination: buildNotesByDenomination(cashNotes),
    tradingHoldings: buildTradingHoldings(trading),
    goldHoldings: buildGoldHoldings(gold),
  };
}
