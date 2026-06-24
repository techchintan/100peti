"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {formatInr, formatPercent} from "@/lib/format";
import type {DashboardChartData, DenominationBreakdown, HoldingPnL, InvestmentCategory, LentByPerson, SavingsRatePeriod, WealthSlice} from "@/lib/finance/chart-data";
import {getNetWorth, type PortfolioSummary} from "@/lib/wealth";

import {ChartCard, EmptyChart} from "./chart-shell";

const wealthConfig = {
  cash: {label: "Cash at Home", color: "hsl(262 83% 58%)"},
  notes: {label: "Physical Notes", color: "hsl(221 83% 53%)"},
  trading: {label: "Trading", color: "hsl(199 89% 48%)"},
  gold: {label: "Gold", color: "hsl(38 92% 50%)"},
} satisfies ChartConfig;

const investmentConfig = {
  invested: {label: "Invested", color: "hsl(215 16% 47%)"},
  value: {label: "Current Value", color: "hsl(142 71% 45%)"},
} satisfies ChartConfig;

const lentConfig = {
  amount: {label: "Lent", color: "hsl(38 92% 50%)"},
} satisfies ChartConfig;

const savingsConfig = {
  savingsRate: {label: "Savings Rate", color: "hsl(142 71% 45%)"},
} satisfies ChartConfig;

const notesConfig = {
  value: {label: "Value", color: "hsl(221 83% 53%)"},
} satisfies ChartConfig;

const holdingConfig = {
  invested: {label: "Cost Basis", color: "hsl(215 16% 47%)"},
  current: {label: "Current Value", color: "hsl(142 71% 45%)"},
  gain: {label: "Gain / Loss", color: "hsl(199 89% 48%)"},
} satisfies ChartConfig;

function WealthAllocationChart({data, netWorth}: {data: WealthSlice[]; netWorth: number}) {
  if (data.length === 0) {
    return <EmptyChart message="Add wealth data in Studio to see allocation." />;
  }

  return (
    <ChartContainer config={wealthConfig} className="mx-auto aspect-square min-h-[280px] max-h-[320px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="key"
              hideLabel
              formatter={(value, _name, item) => {
                const slice = item.payload as WealthSlice;
                const pct = netWorth > 0 ? ((slice.value / netWorth) * 100).toFixed(1) : "0";
                return (
                  <span className="font-mono font-medium">
                    {formatInr(Number(value))} ({pct}%)
                  </span>
                );
              }}
            />
          }
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="key"
          innerRadius={72}
          outerRadius={110}
          strokeWidth={4}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
          ))}
          <Label
            content={({viewBox}) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 8} className="fill-muted-foreground text-xs">
                    Net Worth
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className="fill-foreground text-sm font-semibold">
                    {formatInr(netWorth)}
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  );
}

function InvestmentSummaryChart({data}: {data: InvestmentCategory[]}) {
  if (data.length === 0) {
    return <EmptyChart message="Add trading or gold holdings to compare performance." />;
  }

  return (
    <ChartContainer config={investmentConfig} className="aspect-video min-h-[280px] w-full max-w-none">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="invested" fill="var(--color-invested)" radius={4} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function LentByPersonChart({data}: {data: LentByPerson[]}) {
  if (data.length === 0) {
    return <EmptyChart message="No lent money transactions recorded yet." />;
  }

  const chartHeight = Math.max(220, data.length * 44);

  return (
    <ChartContainer config={lentConfig} className="w-full max-w-none" style={{height: chartHeight}}>
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{left: 8, right: 16}}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={96} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatInr(Number(value))}
              labelFormatter={(label) => `Lent to ${label}`}
            />
          }
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function SavingsRateChart({data}: {data: SavingsRatePeriod[]}) {
  if (data.length === 0) {
    return <EmptyChart message="Need yearly income data to calculate savings rate." />;
  }

  return (
    <ChartContainer config={savingsConfig} className="aspect-video min-h-[260px] w-full max-w-none">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v}%`} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const row = item.payload as SavingsRatePeriod;
                return (
                  <div className="space-y-1 text-right">
                    <div className="font-mono font-medium">{formatPercent(Number(value))}</div>
                    <div className="text-muted-foreground text-[10px]">
                      Net {formatInr(row.netCash)} on {formatInr(row.income)} income
                    </div>
                  </div>
                );
              }}
            />
          }
        />
        <Bar dataKey="savingsRate" radius={4}>
          {data.map((entry) => (
            <Cell
              key={entry.sortKey}
              fill={entry.savingsRate >= 0 ? "var(--color-savingsRate)" : "hsl(0 84% 60%)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function NotesDenominationChart({data}: {data: DenominationBreakdown[]}) {
  if (data.length === 0) {
    return <EmptyChart message="Add cash note denominations in Studio." />;
  }

  return (
    <ChartContainer config={notesConfig} className="aspect-video min-h-[260px] w-full max-w-none">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function HoldingsPnLChart({data, title}: {data: HoldingPnL[]; title: string}) {
  if (data.length === 0) {
    return <EmptyChart message={`No ${title.toLowerCase()} holdings to display.`} />;
  }

  const chartHeight = Math.max(240, data.length * 48);

  return (
    <ChartContainer config={holdingConfig} className="w-full max-w-none" style={{height: chartHeight}}>
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{left: 8, right: 16}}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={108} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="invested" fill="var(--color-invested)" radius={4} />
        <Bar dataKey="current" fill="var(--color-current)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function HoldingsGainChart({data, className}: {data: HoldingPnL[]; className?: string}) {
  if (data.length === 0) return null;

  const chartHeight = Math.max(200, data.length * 40);

  return (
    <ChartContainer
      config={holdingConfig}
      className={className ?? "mt-6 w-full max-w-none border-t pt-6"}
      style={{height: chartHeight}}
    >
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{left: 8, right: 16}}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={108} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatInr(Number(value))}
              labelFormatter={(label) => label}
            />
          }
        />
        <Bar dataKey="gain" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={entry.gain >= 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function DashboardCharts({
  wealth,
  charts,
}: {
  wealth: PortfolioSummary;
  charts: DashboardChartData;
}) {
  const netWorth = getNetWorth(wealth);
  const {
    wealthBreakdown,
    investmentCategories,
    lentByPerson,
    savingsRate,
    notesByDenomination,
    tradingHoldings,
    goldHoldings,
  } = charts;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-zinc-900">Wealth Overview</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Net Worth Allocation"
            description="Share of total wealth across cash, notes, trading, and gold."
          >
            <WealthAllocationChart data={wealthBreakdown} netWorth={netWorth} />
          </ChartCard>
          <ChartCard
            title="Investment Performance"
            description="Invested amount vs current value for trading and gold."
          >
            <InvestmentSummaryChart data={investmentCategories} />
            {investmentCategories.length > 0 && (
              <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 border-t pt-4 text-xs sm:text-sm">
                {investmentCategories.map((row) => (
                  <span key={row.key}>
                    {row.label}:{" "}
                    <strong className={row.gain >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {formatInr(row.gain)} ({formatPercent(row.invested ? (row.gain / row.invested) * 100 : 0)})
                    </strong>
                  </span>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-zinc-900">Rokda Insights</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Lent Money by Person" description="Outstanding lent amounts grouped by borrower.">
            <LentByPersonChart data={lentByPerson} />
          </ChartCard>
          <ChartCard
            title="Yearly Savings Rate"
            description="Net cash retained as a percentage of income each year."
          >
            <SavingsRateChart data={savingsRate} />
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-zinc-900">Holdings Detail</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Physical Notes by Denomination"
            description="Total rupee value held in each note denomination."
          >
            <NotesDenominationChart data={notesByDenomination} />
            {notesByDenomination.length > 0 && (
              <div className="text-muted-foreground mt-4 flex flex-wrap gap-4 border-t pt-4 text-xs sm:text-sm">
                {notesByDenomination.map((row) => (
                  <span key={row.denomination}>
                    {row.label}: <strong>{row.quantity.toLocaleString("en-IN")} notes</strong>
                  </span>
                ))}
              </div>
            )}
          </ChartCard>
          <ChartCard
            title="Trading Holdings"
            description="Cost basis vs current value for each active investment."
          >
            <HoldingsPnLChart data={tradingHoldings} title="Trading" />
            <HoldingsGainChart data={tradingHoldings} />
          </ChartCard>
          <ChartCard
            title="Gold Holdings"
            description="Purchase price vs current value for each gold item."
            className="xl:col-span-2"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                  Value comparison
                </p>
                <HoldingsPnLChart data={goldHoldings} title="Gold" />
              </div>
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                  Gain / loss
                </p>
                <HoldingsGainChart data={goldHoldings} className="w-full max-w-none" />
              </div>
            </div>
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
