import {Gem, Scale, TrendingDown, TrendingUp} from "lucide-react";

import {EmptyState, PageHeader, SectionNav, StatCard} from "@/components/finance/page-shell";
import {HoldingsChartsSection} from "@/components/finance/holdings-charts";
import {LIVE_FETCH_OPTIONS} from "@/lib/finance/data";
import {buildGoldHoldings} from "@/lib/finance/chart-data";
import {normalizePortfolio} from "@/lib/finance/portfolio";
import type {GoldWealthItem} from "@/lib/finance/types";
import {cn} from "@/lib/utils";
import {formatDate, formatInr, formatPercent} from "@/lib/format";
import {getGoldGain, wealthSections, type PortfolioSummary} from "@/lib/wealth";
import {sanityFetch} from "@/sanity/lib/live";
import {GOLD_WEALTH, PORTFOLIO_SUMMARY} from "@/sanity/queries";

export const dynamic = "force-dynamic";

export default async function GoldWealthPage() {
  const [{data: items}, {data: portfolio}] = await Promise.all([
    sanityFetch<GoldWealthItem[]>({query: GOLD_WEALTH, options: LIVE_FETCH_OPTIONS}),
    sanityFetch<PortfolioSummary>({query: PORTFOLIO_SUMMARY, options: LIVE_FETCH_OPTIONS}),
  ]);

  const holdings = items ?? [];
  const summary = normalizePortfolio(portfolio);

  const gain = getGoldGain(summary);
  const gainPct = summary.goldPurchase ? (gain / summary.goldPurchase) * 100 : 0;

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Wealth"
        title="Gold Wealth"
        description="Track gold jewellery, coins, and bars with weight, purity, and current valuation."
        action={{label: "Manage in Studio", href: "/studio/structure/goldWealth"}}
      />
      <SectionNav items={[...wealthSections]} activeHref="/gold-wealth" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Gem} label="Current Value" tone="gold" value={formatInr(summary.goldValue)} />
        <StatCard icon={Scale} label="Total Weight" tone="default" value={`${summary.goldWeight.toFixed(2)} g`} hint={`${summary.goldCount} items`} />
        <StatCard
          icon={gain >= 0 ? TrendingUp : TrendingDown}
          label="Gain / Loss"
          tone={gain >= 0 ? "income" : "expense"}
          value={formatInr(gain)}
          hint={formatPercent(gainPct)}
        />
      </div>

      {holdings.length === 0 ? (
        <EmptyState
          title="No gold holdings yet"
          description="Add items in Sanity Studio with weight, purity, purchase price, and current value."
          action={{label: "Open Studio", href: "/studio/structure/goldWealth"}}
        />
      ) : (
        <div className="space-y-8">
          <HoldingsChartsSection
            title="Gold Holdings"
            description="Purchase price vs current value for each gold item."
            holdings={buildGoldHoldings(holdings)}
          />

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Weight</th>
                  <th className="px-5 py-3 font-medium">Purity</th>
                  <th className="px-5 py-3 font-medium">Purchase</th>
                  <th className="px-5 py-3 font-medium">Current</th>
                  <th className="px-5 py-3 font-medium">P&amp;L</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-zinc-50/80">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">{item.itemName}</p>
                      <p className="text-muted-foreground text-xs">{formatDate(item.purchaseDate)}</p>
                    </td>
                    <td className="px-5 py-4">{item.weightGrams} g</td>
                    <td className="px-5 py-4 uppercase">{item.purity || "—"}</td>
                    <td className="px-5 py-4">{formatInr(item.purchasePrice)}</td>
                    <td className="px-5 py-4 font-medium text-amber-700">{formatInr(item.currentValue)}</td>
                    <td
                      className={cn(
                        "px-5 py-4 font-medium",
                        item.gainLoss >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {formatInr(item.gainLoss)}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">{item.location || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "Gold Wealth | Sudani Family Finance",
  description: "Gold holdings, weight, and valuation for the Sudani family portfolio.",
};
