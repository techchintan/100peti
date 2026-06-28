import type {Home, ROKDA_TRANSACTIONSResult} from "@/sanity.types";
import {getGoldGain, getNetWorth, getTradingGain} from "@/lib/wealth";
import {sanityFetch} from "@/sanity/lib/live";
import {
  CASH_NOTES,
  DASHBOARD_TOTALS,
  HOME,
  PORTFOLIO_SUMMARY,
  ROKDA_TRANSACTIONS,
} from "@/sanity/queries";
import type {PortfolioSummary} from "@/lib/wealth";

import {
  buildDashboardChartData,
  toCashFlowTransactions,
  type CashFlowTransaction,
  type DashboardChartData,
} from "./chart-data";
import {normalizeDashboardTotals, normalizePortfolio, enrichWealthFromCashNotes} from "./portfolio";
import type {CashNote, DashboardTotals} from "./types";

export const LIVE_FETCH_OPTIONS = {
  cache: "no-store" as const,
  next: {revalidate: 0, tags: [] as string[]},
};

export type HomePageData = {
  home: Home | null;
  wealth: PortfolioSummary;
  totals: DashboardTotals;
  transactions: CashFlowTransaction[];
  defaultFinancialYear: string;
  charts: DashboardChartData;
  netWorth: number;
  tradingGain: number;
  goldGain: number;
};

export async function getHomePageData(): Promise<HomePageData> {
  const [
    {data: transactions},
    {data: totals},
    {data: portfolio},
    {data: home},
    {data: cashNotes},
  ] = await Promise.all([
    sanityFetch<ROKDA_TRANSACTIONSResult>({
      query: ROKDA_TRANSACTIONS,
      params: {type: "all"},
      options: LIVE_FETCH_OPTIONS,
    }),
    sanityFetch<DashboardTotals>({
      query: DASHBOARD_TOTALS,
      options: LIVE_FETCH_OPTIONS,
    }),
    sanityFetch<PortfolioSummary>({
      query: PORTFOLIO_SUMMARY,
      options: LIVE_FETCH_OPTIONS,
    }),
    sanityFetch<Home>({
      query: HOME,
      options: LIVE_FETCH_OPTIONS,
    }),
    sanityFetch<CashNote[]>({
      query: CASH_NOTES,
      options: LIVE_FETCH_OPTIONS,
    }),
  ]);

  const summary = normalizeDashboardTotals(totals);
  const wealth = enrichWealthFromCashNotes(normalizePortfolio(portfolio, summary.cash), cashNotes);
  const cashFlowTransactions = toCashFlowTransactions(transactions);

  return {
    home: home ?? null,
    wealth,
    totals: summary,
    transactions: cashFlowTransactions,
    defaultFinancialYear: "all",
    charts: buildDashboardChartData({
      wealth,
      transactions,
    }),
    netWorth: getNetWorth(wealth),
    tradingGain: getTradingGain(wealth),
    goldGain: getGoldGain(wealth),
  };
}

export async function getRokdaPageData() {
  const [{data: transactions}, {data: totals}] = await Promise.all([
    sanityFetch<ROKDA_TRANSACTIONSResult>({
      query: ROKDA_TRANSACTIONS,
      params: {type: "all"},
      options: LIVE_FETCH_OPTIONS,
    }),
    sanityFetch<DashboardTotals>({
      query: DASHBOARD_TOTALS,
      options: LIVE_FETCH_OPTIONS,
    }),
  ]);

  return {
    transactions: transactions ?? [],
    totals: normalizeDashboardTotals(totals),
  };
}
