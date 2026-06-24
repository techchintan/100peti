import {LineChart, TrendingDown, TrendingUp, Wallet} from "lucide-react";

import {EmptyState, PageHeader, SectionNav, StatCard} from "@/components/finance/page-shell";
import {LIVE_FETCH_OPTIONS} from "@/lib/finance/data";
import {getActiveTradingInvestments, normalizePortfolio} from "@/lib/finance/portfolio";
import type {TradingInvestment} from "@/lib/finance/types";
import {cn} from "@/lib/utils";
import {formatDate, formatInr, formatPercent} from "@/lib/format";
import {getTradingGain, wealthSections, type PortfolioSummary} from "@/lib/wealth";
import {sanityFetch} from "@/sanity/lib/live";
import {PORTFOLIO_SUMMARY, TRADING_INVESTMENTS} from "@/sanity/queries";

export const dynamic = "force-dynamic";

export default async function TradingInvestmentPage() {
  const [{data: holdings}, {data: portfolio}] = await Promise.all([
    sanityFetch<TradingInvestment[]>({query: TRADING_INVESTMENTS, options: LIVE_FETCH_OPTIONS}),
    sanityFetch<PortfolioSummary>({query: PORTFOLIO_SUMMARY, options: LIVE_FETCH_OPTIONS}),
  ]);

  const items = getActiveTradingInvestments(holdings);
  const summary = normalizePortfolio(portfolio);

  const gain = getTradingGain(summary);
  const gainPct = summary.tradingInvested ? (gain / summary.tradingInvested) * 100 : 0;

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Wealth"
        title="Trading & Investment"
        description="Stocks, mutual funds, ETFs, and other market holdings with invested vs current value."
        action={{label: "Manage in Studio", href: "/studio/structure/tradingInvestment"}}
      />
      <SectionNav items={[...wealthSections]} activeHref="/trading-investment" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Current Value" tone="trading" value={formatInr(summary.tradingValue)} />
        <StatCard icon={LineChart} label="Invested" tone="default" value={formatInr(summary.tradingInvested)} />
        <StatCard
          icon={gain >= 0 ? TrendingUp : TrendingDown}
          label="Gain / Loss"
          tone={gain >= 0 ? "income" : "expense"}
          value={formatInr(gain)}
          hint={formatPercent(gainPct)}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No active investments"
          description="Add holdings in Sanity Studio with invested amount and current market value."
          action={{label: "Open Studio", href: "/studio/structure/tradingInvestment"}}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const positive = item.gainLoss >= 0;
            return (
              <article key={item._id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">{item.name}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {[item.platform, item.assetType?.replace("-", " "), formatDate(item.purchaseDate)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold uppercase",
                      positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {positive ? "Gain" : "Loss"}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Invested</p>
                    <p className="mt-1 font-medium">{formatInr(item.investedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">Current</p>
                    <p className="mt-1 font-semibold text-sky-700">{formatInr(item.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">P&amp;L</p>
                    <p className={cn("mt-1 font-medium", positive ? "text-emerald-600" : "text-rose-600")}>
                      {formatInr(item.gainLoss)}
                    </p>
                  </div>
                </div>
                {item.notes ? <p className="text-muted-foreground mt-4 text-sm">{item.notes}</p> : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "Trading & Investment | Sudani Family Finance",
  description: "Portfolio of stocks, mutual funds, and market investments.",
};
