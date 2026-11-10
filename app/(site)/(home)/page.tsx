import {StatCard} from "@/components/finance/page-shell";
import {CashFlowCharts} from "@/components/finance/cash-flow-charts";
import {DashboardCharts} from "@/components/finance/dashboard-charts";
import {getHomePageData} from "@/lib/finance/data";
import {formatInr, formatPercent} from "@/lib/format";
import {sanityFetch} from "@/sanity/lib/live";
import {HOME} from "@/sanity/queries";
import type {Home} from "@/sanity.types";
import {Banknote, Gem, LineChart, Wallet} from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function HomePage() {
  const {
    home,
    wealth,
    totals,
    transactions,
    defaultFinancialYear,
    charts,
    netWorth,
    tradingGain,
    goldGain,
  } = await getHomePageData();

  const tradingGainPct = wealth.tradingInvested ? (tradingGain / wealth.tradingInvested) * 100 : 0;
  const goldGainPct = wealth.goldPurchase ? (goldGain / wealth.goldPurchase) * 100 : 0;

  return (
    <div className="space-y-10 pb-8">
      <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-10 text-white shadow-lg sm:px-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
            Family Wealth
          </p>
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
          hint={`${wealth.goldWeight.toFixed(1)}g · ${formatInr(goldGain)} (${formatPercent(goldGainPct)})`}
        />
      </section>

      <section className="space-y-4">
        <CashFlowCharts
          transactions={transactions}
          totals={totals}
          defaultFinancialYear={defaultFinancialYear}
        />
      </section>

      <DashboardCharts wealth={wealth} charts={charts} />
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
