"use client";

import type {DashboardChartData} from "@/lib/finance/chart-data";
import {getNetWorth, type PortfolioSummary} from "@/lib/wealth";

import {ChartCard} from "./chart-shell";
import {
  InvestmentSummaryChart,
  InvestmentSummaryFooter,
  LentByPersonChart,
  WealthAllocationChart,
} from "./holdings-charts";

export function DashboardCharts({
  wealth,
  charts,
}: {
  wealth: PortfolioSummary;
  charts: DashboardChartData;
}) {
  const netWorth = getNetWorth(wealth);
  const {wealthBreakdown, investmentCategories, lentByPerson} = charts;
  const hasActiveLent = lentByPerson.length > 0;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-zinc-900">Wealth Snapshot</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Net Worth Allocation"
            description="Share of total wealth across cash, notes, trading, and gold."
          >
            <WealthAllocationChart data={wealthBreakdown} netWorth={netWorth} />
          </ChartCard>
          <ChartCard
            title="Investments at a Glance"
            description="Invested amount vs current value for trading and gold."
          >
            <InvestmentSummaryChart data={investmentCategories} />
            <InvestmentSummaryFooter data={investmentCategories} />
          </ChartCard>
        </div>
      </section>

      {hasActiveLent && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-zinc-900">Outstanding Lent Money</h2>
          <ChartCard title="Lent by Person" description="Active lent amounts grouped by borrower.">
            <LentByPersonChart data={lentByPerson} />
          </ChartCard>
        </section>
      )}
    </div>
  );
}
