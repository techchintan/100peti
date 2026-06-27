import type {PortfolioSummary} from "@/lib/wealth";

import {getCashNoteValue} from "./cash-notes";
import type {CashNote, DashboardTotals, RokdaTransactionLike, TradingInvestment} from "./types";

/** GROQ filter: regular expenses (not lent money). */
export const GROQ_REGULAR_EXPENSE =
  '_type == "transactions" && transactionType == "expense" && !coalesce(isBorrow, false)';

/** GROQ filter: active lent money still outstanding. */
export const GROQ_ACTIVE_LENT =
  '_type == "transactions" && transactionType == "expense" && isBorrow == true';

export function isActiveLent(transaction: RokdaTransactionLike) {
  return transaction.transactionType === "expense" && Boolean(transaction.isBorrow);
}

export function isReturnedIncome(description?: string | null) {
  return Boolean(description?.trim().toLowerCase().startsWith("received back from"));
}

export function buildReturnedIncomeDescription(borrowerName: string, note?: string | null) {
  const base = `Received back from ${borrowerName}`;
  return note?.trim() ? `${base} — ${note.trim()}` : base;
}

const EMPTY_PORTFOLIO: PortfolioSummary = {
  cash: 0,
  notesValue: 0,
  notesCount: 0,
  tradingValue: 0,
  tradingInvested: 0,
  tradingCount: 0,
  goldValue: 0,
  goldPurchase: 0,
  goldCount: 0,
  goldWeight: 0,
};

export function normalizeDashboardTotals(totals?: Partial<DashboardTotals> | null): DashboardTotals {
  return {
    income: totals?.income ?? 0,
    expense: totals?.expense ?? 0,
    lentMoney: totals?.lentMoney ?? 0,
    cash: totals?.cash ?? 0,
  };
}

export function normalizePortfolio(
  portfolio?: Partial<PortfolioSummary> | null,
  cashFallback = 0,
): PortfolioSummary {
  return {
    cash: portfolio?.cash ?? cashFallback,
    notesValue: portfolio?.notesValue ?? EMPTY_PORTFOLIO.notesValue,
    notesCount: portfolio?.notesCount ?? EMPTY_PORTFOLIO.notesCount,
    tradingValue: portfolio?.tradingValue ?? EMPTY_PORTFOLIO.tradingValue,
    tradingInvested: portfolio?.tradingInvested ?? EMPTY_PORTFOLIO.tradingInvested,
    tradingCount: portfolio?.tradingCount ?? EMPTY_PORTFOLIO.tradingCount,
    goldValue: portfolio?.goldValue ?? EMPTY_PORTFOLIO.goldValue,
    goldPurchase: portfolio?.goldPurchase ?? EMPTY_PORTFOLIO.goldPurchase,
    goldCount: portfolio?.goldCount ?? EMPTY_PORTFOLIO.goldCount,
    goldWeight: portfolio?.goldWeight ?? EMPTY_PORTFOLIO.goldWeight,
  };
}

export function getActiveTradingInvestments(items?: TradingInvestment[] | null) {
  return (items ?? []).filter((item) => item.status !== "sold");
}

/** Use fetched note rows when portfolio GROQ returns no notes value. */
export function enrichWealthFromCashNotes(
  wealth: PortfolioSummary,
  cashNotes?: CashNote[] | null,
): PortfolioSummary {
  if (wealth.notesValue > 0) return wealth;

  const notes = cashNotes ?? [];
  if (notes.length === 0) return wealth;

  const notesValue = notes.reduce((sum, note) => sum + getCashNoteValue(note), 0);
  if (notesValue === 0) return wealth;

  return {
    ...wealth,
    notesValue,
    notesCount: notes.length,
  };
}
