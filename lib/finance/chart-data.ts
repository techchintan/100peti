import type {ROKDA_TRANSACTIONSResult} from "@/sanity.types";
import {getGoldGain, getTradingGain, type PortfolioSummary} from "@/lib/wealth";

import {
  describeDiwaliYearWindow,
  formatDiwaliYearLabel,
  getDiwaliYearKey,
  getDiwaliYearStartDate,
  isDateInDiwaliYear,
  listDiwaliYearKeys,
} from "./diwali-year";
import {
  formatFinancialYearLabel,
  getFinancialYearKey,
  getFinancialYearStartDate,
  isDateInFinancialYear,
  listFinancialYearKeys,
} from "./financial-year";
import {isActiveLent, isReturnedIncome} from "./portfolio";
import type {CashNote, GoldWealthItem, TradingInvestment} from "./types";

export type CashFlowTransaction = {
  transactionDate: string;
  transactionType: string;
  transactionAmount: number;
  isBorrow?: boolean | null;
  transactionDescription?: string | null;
};

export type CashFlowPeriod = {
  label: string;
  sortKey: string;
  income: number;
  expense: number;
  lentMoney: number;
  netCash: number;
};

export type CashFlowTotals = {
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
};

export type RunningBalancePoint = {
  label: string;
  sortKey: string;
  balance: number;
  netChange: number;
};

export type WaterfallBar = {
  label: string;
  key: string;
  base: number;
  amount: number;
  total: number;
  kind: "start" | "positive" | "negative" | "end";
};

export type NetChangePeriod = CashFlowPeriod & {
  savingsRate: number;
};

export type TrendPeriod = {
  label: string;
  sortKey: string;
  income: number;
  expense: number;
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
  transaction: CashFlowTransaction,
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
    if (isActiveLent(transaction)) {
      existing.lentMoney += transaction.transactionAmount;
    } else if (!transaction.isBorrow) {
      existing.expense += transaction.transactionAmount;
    }
  }

  map.set(sortKey, withNetCash(existing));
}

export function aggregateCashFlowTotals(periods: CashFlowPeriod[]): CashFlowTotals {
  return periods.reduce(
    (acc, row) => ({
      income: acc.income + row.income,
      expense: acc.expense + row.expense,
      lentMoney: acc.lentMoney + row.lentMoney,
      netCash: acc.netCash + row.netCash,
    }),
    {income: 0, expense: 0, lentMoney: 0, netCash: 0},
  );
}

export function savingsRateFromTotals(totals: Pick<CashFlowTotals, "income" | "netCash">): number {
  return totals.income > 0 ? (totals.netCash / totals.income) * 100 : 0;
}

export function computeCashBalanceFromTransactions(
  transactions?: CashFlowTransaction[] | null,
): number {
  return aggregateCashFlowTotals(buildAllTimeCashFlowPeriod(transactions)).netCash;
}

function buildAllTimeCashFlowPeriod(transactions?: CashFlowTransaction[] | null): CashFlowPeriod[] {
  const totals = aggregateCashFlowTotalsFromTransactions(transactions);
  return [{label: "All time", sortKey: "all", ...totals}];
}

function aggregateCashFlowTotalsFromTransactions(
  transactions?: CashFlowTransaction[] | null,
): CashFlowTotals {
  const map = new Map<string, CashFlowPeriod>();
  for (const transaction of transactions ?? []) {
    upsertCashFlowPeriod(map, "all", "All time", transaction);
  }
  const period = map.get("all");
  return period
    ? {
        income: period.income,
        expense: period.expense,
        lentMoney: period.lentMoney,
        netCash: period.netCash,
      }
    : {income: 0, expense: 0, lentMoney: 0, netCash: 0};
}

function monthPeriodFromDate(dateInput: string): {sortKey: string; label: string} {
  const match = /^(\d{4})-(\d{2})/.exec(dateInput);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    return {
      sortKey: `${match[1]}-${match[2]}`,
      label: new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
    };
  }

  const date = new Date(dateInput);
  return {
    sortKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    label: date.toLocaleDateString("en-IN", {month: "short", year: "numeric"}),
  };
}

export function getFinancialYearOptions(transactions?: CashFlowTransaction[] | null) {
  const keys = listFinancialYearKeys((transactions ?? []).map((t) => t.transactionDate));
  return keys.map((key) => ({value: key, label: formatFinancialYearLabel(key)}));
}

export function getDiwaliYearOptions(transactions?: CashFlowTransaction[] | null) {
  const keys = listDiwaliYearKeys((transactions ?? []).map((t) => t.transactionDate));
  return keys.map((key) => ({
    value: key,
    label: formatDiwaliYearLabel(key),
    description: describeDiwaliYearWindow(key),
  }));
}

export function filterTransactionsByFinancialYear(
  transactions: CashFlowTransaction[] | null | undefined,
  fyKey: string,
): CashFlowTransaction[] {
  return (transactions ?? []).filter((t) => isDateInFinancialYear(t.transactionDate, fyKey));
}

export function filterTransactionsBeforeDate(
  transactions: CashFlowTransaction[] | null | undefined,
  beforeDate: string,
): CashFlowTransaction[] {
  const before = new Date(beforeDate).getTime();
  return (transactions ?? []).filter((t) => new Date(t.transactionDate).getTime() < before);
}

export function buildFinancialYearCashFlow(
  transactions?: CashFlowTransaction[] | null,
): CashFlowPeriod[] {
  const map = new Map<string, CashFlowPeriod>();

  for (const transaction of transactions ?? []) {
    const fyKey = getFinancialYearKey(transaction.transactionDate);
    upsertCashFlowPeriod(map, fyKey, formatFinancialYearLabel(fyKey), transaction);
  }

  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function buildFinancialYearMonthlyCashFlow(
  transactions: CashFlowTransaction[] | null | undefined,
  fyKey: string,
): CashFlowPeriod[] {
  const map = new Map<string, CashFlowPeriod>();

  for (const transaction of filterTransactionsByFinancialYear(transactions, fyKey)) {
    const {sortKey, label} = monthPeriodFromDate(transaction.transactionDate);
    upsertCashFlowPeriod(map, sortKey, label, transaction);
  }

  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function buildRunningBalance(
  monthlyPeriods: CashFlowPeriod[],
  openingBalance: number,
): RunningBalancePoint[] {
  let balance = openingBalance;
  return monthlyPeriods.map((period) => {
    balance += period.netCash;
    return {
      label: period.label,
      sortKey: period.sortKey,
      netChange: period.netCash,
      balance,
    };
  });
}

export function buildFyEndBalanceTrend(fyPeriods: CashFlowPeriod[]): RunningBalancePoint[] {
  let balance = 0;
  return fyPeriods.map((period) => {
    balance += period.netCash;
    return {
      label: period.label,
      sortKey: period.sortKey,
      netChange: period.netCash,
      balance,
    };
  });
}

export function buildNetChangePeriods(periods: CashFlowPeriod[]): NetChangePeriod[] {
  return periods.map((period) => ({
    ...period,
    savingsRate: savingsRateFromTotals(period),
  }));
}

export function filterTransactionsByDiwaliYear(
  transactions: CashFlowTransaction[] | null | undefined,
  diwaliKey: string,
): CashFlowTransaction[] {
  return (transactions ?? []).filter((t) => isDateInDiwaliYear(t.transactionDate, diwaliKey));
}

export function buildDiwaliYearCashFlow(
  transactions?: CashFlowTransaction[] | null,
): CashFlowPeriod[] {
  const map = new Map<string, CashFlowPeriod>();

  for (const transaction of transactions ?? []) {
    const diwaliKey = getDiwaliYearKey(transaction.transactionDate);
    upsertCashFlowPeriod(map, diwaliKey, formatDiwaliYearLabel(diwaliKey), transaction);
  }

  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function buildDiwaliYearMonthlyCashFlow(
  transactions: CashFlowTransaction[] | null | undefined,
  diwaliKey: string,
): CashFlowPeriod[] {
  const map = new Map<string, CashFlowPeriod>();

  for (const transaction of filterTransactionsByDiwaliYear(transactions, diwaliKey)) {
    const {sortKey, label} = monthPeriodFromDate(transaction.transactionDate);
    upsertCashFlowPeriod(map, sortKey, label, transaction);
  }

  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function buildCashBridgeWaterfall(
  opening: number,
  periodTransactions: CashFlowTransaction[],
): WaterfallBar[] {
  let income = 0;
  let expense = 0;
  let lent = 0;
  let returns = 0;

  for (const transaction of periodTransactions) {
    if (transaction.transactionType === "income") {
      income += transaction.transactionAmount;
      if (isReturnedIncome(transaction.transactionDescription)) {
        returns += transaction.transactionAmount;
      }
    } else if (transaction.transactionType === "expense") {
      if (isActiveLent(transaction)) {
        lent += transaction.transactionAmount;
      } else if (!transaction.isBorrow) {
        expense += transaction.transactionAmount;
      }
    }
  }

  const regularIncome = income - returns;
  const closing = opening + income - expense - lent;
  const bars: WaterfallBar[] = [];
  let running = opening;

  bars.push({
    label: "Opening",
    key: "opening",
    base: 0,
    amount: opening,
    total: opening,
    kind: "start",
  });

  if (regularIncome > 0) {
    bars.push({
      label: "Income",
      key: "income",
      base: running,
      amount: regularIncome,
      total: running + regularIncome,
      kind: "positive",
    });
    running += regularIncome;
  }

  if (returns > 0) {
    bars.push({
      label: "Cash returned",
      key: "returns",
      base: running,
      amount: returns,
      total: running + returns,
      kind: "positive",
    });
    running += returns;
  }

  if (expense > 0) {
    running -= expense;
    bars.push({
      label: "Expense",
      key: "expense",
      base: running,
      amount: expense,
      total: running,
      kind: "negative",
    });
  }

  if (lent > 0) {
    running -= lent;
    bars.push({
      label: "Lent",
      key: "lent",
      base: running,
      amount: lent,
      total: running,
      kind: "negative",
    });
  }

  bars.push({
    label: "Closing",
    key: "closing",
    base: 0,
    amount: closing,
    total: closing,
    kind: "end",
  });

  return bars;
}

export function buildFinancialYearWaterfall(
  transactions: CashFlowTransaction[] | null | undefined,
  fyKey: string,
): WaterfallBar[] {
  const fyStart = getFinancialYearStartDate(fyKey);
  const opening = computeCashBalanceFromTransactions(
    filterTransactionsBeforeDate(transactions, fyStart),
  );
  return buildCashBridgeWaterfall(opening, filterTransactionsByFinancialYear(transactions, fyKey));
}

export function buildDiwaliYearWaterfall(
  transactions: CashFlowTransaction[] | null | undefined,
  diwaliKey: string,
): WaterfallBar[] {
  const diwaliStart = getDiwaliYearStartDate(diwaliKey);
  const opening = diwaliStart
    ? computeCashBalanceFromTransactions(filterTransactionsBeforeDate(transactions, diwaliStart))
    : 0;
  return buildCashBridgeWaterfall(opening, filterTransactionsByDiwaliYear(transactions, diwaliKey));
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

export function buildLentByPerson(transactions?: ROKDA_TRANSACTIONSResult | null): LentByPerson[] {
  const map = new Map<string, number>();

  for (const transaction of transactions ?? []) {
    if (!isActiveLent(transaction)) continue;
    const name = transaction.borrower?.name?.trim() || "Unknown";
    map.set(name, (map.get(name) ?? 0) + transaction.transactionAmount);
  }

  return [...map.entries()]
    .map(([name, amount]) => ({name, amount}))
    .sort((a, b) => b.amount - a.amount);
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
}: {
  wealth: PortfolioSummary;
  transactions?: ROKDA_TRANSACTIONSResult | null;
}): DashboardChartData {
  return {
    wealthBreakdown: buildWealthBreakdown(wealth),
    investmentCategories: buildInvestmentCategories(wealth),
    lentByPerson: buildLentByPerson(transactions),
  };
}

export function toCashFlowTransactions(
  transactions?: ROKDA_TRANSACTIONSResult | null,
): CashFlowTransaction[] {
  return (transactions ?? []).map((transaction) => ({
    transactionDate: transaction.transactionDate,
    transactionType: transaction.transactionType,
    transactionAmount: transaction.transactionAmount,
    isBorrow: transaction.isBorrow,
    transactionDescription: transaction.transactionDescription,
  }));
}
