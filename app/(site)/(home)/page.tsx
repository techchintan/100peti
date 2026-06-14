import {Transactions, type Home} from "@/sanity.types";
import {StatCard} from "@/components/finance/page-shell";
import {sanityFetch} from "@/sanity/lib/live";
import {DASHBOARD_TOTALS, HOME, PORTFOLIO_SUMMARY, ROKDA_TRANSACTIONS} from "@/sanity/queries";
import {formatInr, formatPercent} from "@/lib/format";
import {
  getGoldGain,
  getNetWorth,
  getTradingGain,
  type PortfolioSummary,
} from "@/lib/wealth";
import {Banknote, Gem, IndianRupee, LineChart, Wallet} from "lucide-react";

import {IncomeExpense} from "./income-expense";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type DashboardTotals = {
  income: number;
  expense: number;
  lentMoney: number;
  cash: number;
};

function buildChartData(transactions: Transactions[] | null) {
  return transactions
    ?.reduce(
      (acc, transaction) => {
        const date = new Date(transaction.transactionDate);
        const monthYear = `${date.toLocaleDateString("en-IN", {month: "short"})} ${date.getFullYear()}`;

        const existingMonth = acc.find((item) => item.month === monthYear);

        if (existingMonth) {
          if (transaction.transactionType === "income") {
            existingMonth.income += transaction.transactionAmount;
          } else if (transaction.transactionType === "expense") {
            if (transaction.isBorrow) {
              existingMonth.lentMoney += transaction.transactionAmount;
            } else {
              existingMonth.expense += transaction.transactionAmount;
            }
          }
        } else {
          acc.push({
            month: monthYear,
            income: transaction.transactionType === "income" ? transaction.transactionAmount : 0,
            expense:
              transaction.transactionType === "expense" && !transaction.isBorrow
                ? transaction.transactionAmount
                : 0,
            lentMoney:
              transaction.transactionType === "expense" && transaction.isBorrow
                ? transaction.transactionAmount
                : 0,
          });
        }

        return acc;
      },
      [] as Array<{month: string; income: number; expense: number; lentMoney: number}>,
    )
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

export default async function HomePage() {
  const [{data: transactions}, {data: totals}, {data: portfolio}, {data: home}] = await Promise.all([
    sanityFetch<Transactions[]>({
      query: ROKDA_TRANSACTIONS,
      params: {type: "all"},
      options: {cache: "no-store", next: {revalidate: 0, tags: []}},
    }),
    sanityFetch<DashboardTotals>({
      query: DASHBOARD_TOTALS,
      options: {cache: "no-store", next: {revalidate: 0, tags: []}},
    }),
    sanityFetch<PortfolioSummary>({
      query: PORTFOLIO_SUMMARY,
      options: {cache: "no-store", next: {revalidate: 0, tags: []}},
    }),
    sanityFetch<Home>({
      query: HOME,
      options: {cache: "no-store", next: {revalidate: 0, tags: []}},
    }),
  ]);

  const summary = {
    income: totals?.income ?? 0,
    expense: totals?.expense ?? 0,
    lentMoney: totals?.lentMoney ?? 0,
    cash: totals?.cash ?? 0,
  };

  const wealth: PortfolioSummary = {
    cash: portfolio?.cash ?? summary.cash,
    notesValue: portfolio?.notesValue ?? 0,
    notesCount: portfolio?.notesCount ?? 0,
    tradingValue: portfolio?.tradingValue ?? 0,
    tradingInvested: portfolio?.tradingInvested ?? 0,
    tradingCount: portfolio?.tradingCount ?? 0,
    goldValue: portfolio?.goldValue ?? 0,
    goldPurchase: portfolio?.goldPurchase ?? 0,
    goldCount: portfolio?.goldCount ?? 0,
    goldWeight: portfolio?.goldWeight ?? 0,
  };

  const netWorth = getNetWorth(wealth);
  const tradingGain = getTradingGain(wealth);
  const goldGain = getGoldGain(wealth);
  const tradingGainPct = wealth.tradingInvested ? (tradingGain / wealth.tradingInvested) * 100 : 0;
  const goldGainPct = wealth.goldPurchase ? (goldGain / wealth.goldPurchase) * 100 : 0;

  return (
    <div className="space-y-10 pb-8">
      <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-10 text-white shadow-lg sm:px-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">Family Wealth</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {home?.tagline || "Sudani Family Finance"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            {home?.seo?.metaDescription ||
              "A private dashboard for cash at home, physical notes, trading investments, and gold wealth."}
          </p>
          <div className="pt-2">
            <p className="text-xs tracking-wide text-zinc-400 uppercase">Estimated Net Worth</p>
            <p className="mt-1 text-4xl font-semibold sm:text-5xl">{formatInr(netWorth)}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-emerald-500/10 to-transparent" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/cash/rokda"
          icon={Wallet}
          label="Cash at Home"
          tone="cash"
          value={formatInr(wealth.cash)}
          hint="Income − expense − lent"
        />
        <StatCard
          href="/cash/new-notes"
          icon={Banknote}
          label="Physical Notes"
          tone="default"
          value={formatInr(wealth.notesValue)}
          hint={`${wealth.notesCount} denomination records`}
        />
        <StatCard
          href="/trading-investment"
          icon={LineChart}
          label="Trading & Investment"
          tone="trading"
          value={formatInr(wealth.tradingValue)}
          hint={`${formatInr(tradingGain)} (${formatPercent(tradingGainPct)})`}
        />
        <StatCard
          href="/gold-wealth"
          icon={Gem}
          label="Gold Wealth"
          tone="gold"
          value={formatInr(wealth.goldValue)}
          hint={`${(wealth.goldWeight ?? 0).toFixed(1)}g · ${formatInr(goldGain)} (${formatPercent(goldGainPct)})`}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <IndianRupee className="size-5 text-emerald-600" />
          <h2 className="font-serif text-2xl font-semibold text-zinc-900">Rokda Cash Flow</h2>
        </div>
        <IncomeExpense chartData={buildChartData(transactions) ?? []} totals={summary} />
      </section>
    </div>
  );
}

export async function generateMetadata() {
  const {data: home} = await sanityFetch<Home>({query: HOME});

  return {
    title: home?.seo?.metaTitle || "Sudani Family Finance",
    description:
      home?.seo?.metaDescription ||
      "Private family wealth dashboard for cash, notes, trading, and gold.",
  };
}
