"use client";

import {useMemo, useState} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {formatInr, formatPercent} from "@/lib/format";
import {
  aggregateCashFlowTotals,
  buildDiwaliYearCashFlow,
  buildDiwaliYearMonthlyCashFlow,
  buildDiwaliYearWaterfall,
  buildFinancialYearCashFlow,
  buildFinancialYearMonthlyCashFlow,
  buildFinancialYearWaterfall,
  buildFyEndBalanceTrend,
  buildNetChangePeriods,
  buildRunningBalance,
  filterTransactionsBeforeDate,
  getDiwaliYearOptions,
  getFinancialYearOptions,
  savingsRateFromTotals,
  computeCashBalanceFromTransactions,
  type CashFlowPeriod,
  type CashFlowTransaction,
  type WaterfallBar,
} from "@/lib/finance/chart-data";
import {cashFlowChartConfig} from "@/lib/finance/chart-theme";
import {
  describeDiwaliYearWindow,
  formatDiwaliYearLabel,
  getDiwaliYearStartDate,
} from "@/lib/finance/diwali-year";
import {formatFinancialYearLabel, getFinancialYearStartDate} from "@/lib/finance/financial-year";
import type {DashboardTotals} from "@/lib/finance/types";

import {EmptyChart, PeriodToggle} from "./chart-shell";

const cashFlowConfig = cashFlowChartConfig;

type ChartView = "flow" | "net" | "balance" | "waterfall";
type PeriodBasis = "fy" | "diwali";
type PeriodScope = "all" | string;

function CashFlowGroupedChart({data, dense}: {data: CashFlowPeriod[]; dense?: boolean}) {
  return (
    <ChartContainer
      config={cashFlowConfig}
      className="aspect-video min-h-[280px] w-full max-w-none"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          fontSize={12}
          interval={dense && data.length > 8 ? "preserveStartEnd" : 0}
          angle={dense && data.length > 8 ? -35 : 0}
          textAnchor={dense && data.length > 8 ? "end" : "middle"}
          height={dense && data.length > 8 ? 56 : 30}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => formatInr(v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
        <Bar dataKey="lentMoney" fill="var(--color-lentMoney)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function NetChangeComboChart({data}: {data: ReturnType<typeof buildNetChangePeriods>}) {
  return (
    <ChartContainer
      config={cashFlowConfig}
      className="aspect-video min-h-[280px] w-full max-w-none"
    >
      <ComposedChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => formatInr(v)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => `${v}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "savingsRate") return formatPercent(Number(value));
                return formatInr(Number(value));
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar yAxisId="left" dataKey="netCash" radius={4}>
          {data.map((entry) => (
            <Cell
              key={entry.sortKey}
              fill={entry.netCash >= 0 ? "var(--color-income)" : "var(--color-expense)"}
            />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="savingsRate"
          stroke="var(--color-savingsRate)"
          strokeWidth={2}
          dot={{r: 3}}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

function RunningBalanceChart({data}: {data: ReturnType<typeof buildRunningBalance>}) {
  return (
    <ChartContainer
      config={cashFlowConfig}
      className="aspect-video min-h-[260px] w-full max-w-none"
    >
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => formatInr(v)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "balance") return formatInr(Number(value));
                return formatInr(Number(value));
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="var(--color-balance)"
          fill="var(--color-balance)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function waterfallColor(kind: WaterfallBar["kind"]) {
  if (kind === "start" || kind === "end") return "hsl(215 16% 47%)";
  if (kind === "positive") return "hsl(142 71% 45%)";
  return "hsl(0 84% 60%)";
}

function WaterfallChart({data}: {data: WaterfallBar[]}) {
  return (
    <ChartContainer
      config={cashFlowConfig}
      className="aspect-video min-h-[280px] w-full max-w-none"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(v) => formatInr(v)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const row = item.payload as WaterfallBar;
                return (
                  <div className="space-y-1 text-right">
                    <div className="font-mono font-medium">{formatInr(Number(value))}</div>
                    <div className="text-muted-foreground text-[10px]">
                      Total {formatInr(row.total)}
                    </div>
                  </div>
                );
              }}
            />
          }
        />
        <Bar dataKey="base" stackId="waterfall" fill="transparent" />
        <Bar dataKey="amount" stackId="waterfall" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.key} fill={waterfallColor(entry.kind)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function CashFlowCharts({
  transactions,
  totals,
  defaultFinancialYear,
}: {
  transactions: CashFlowTransaction[];
  totals: DashboardTotals;
  defaultFinancialYear: string;
}) {
  const [basis, setBasis] = useState<PeriodBasis>("fy");
  const [scope, setScope] = useState<PeriodScope>(defaultFinancialYear);
  const [chartView, setChartView] = useState<ChartView>("flow");

  const yearOptions = useMemo(
    () =>
      basis === "fy" ? getFinancialYearOptions(transactions) : getDiwaliYearOptions(transactions),
    [basis, transactions],
  );

  const periodData = useMemo(() => {
    if (basis === "fy") {
      return scope === "all"
        ? buildFinancialYearCashFlow(transactions)
        : buildFinancialYearMonthlyCashFlow(transactions, scope);
    }
    return scope === "all"
      ? buildDiwaliYearCashFlow(transactions)
      : buildDiwaliYearMonthlyCashFlow(transactions, scope);
  }, [basis, scope, transactions]);

  const periodTotals = useMemo(() => aggregateCashFlowTotals(periodData), [periodData]);
  const savingsRate = savingsRateFromTotals(periodTotals);

  const netChangeData = useMemo(() => buildNetChangePeriods(periodData), [periodData]);

  const balanceData = useMemo(() => {
    if (scope === "all") return buildFyEndBalanceTrend(periodData);
    const startDate =
      basis === "fy" ? getFinancialYearStartDate(scope) : getDiwaliYearStartDate(scope);
    const opening = startDate
      ? computeCashBalanceFromTransactions(filterTransactionsBeforeDate(transactions, startDate))
      : 0;
    return buildRunningBalance(periodData, opening);
  }, [basis, periodData, scope, transactions]);

  const waterfallData = useMemo(() => {
    if (scope === "all") return [];
    return basis === "fy"
      ? buildFinancialYearWaterfall(transactions, scope)
      : buildDiwaliYearWaterfall(transactions, scope);
  }, [basis, scope, transactions]);

  const periodLabel =
    scope === "all"
      ? null
      : basis === "fy"
        ? formatFinancialYearLabel(scope)
        : formatDiwaliYearLabel(scope);

  const periodDescription =
    basis === "fy"
      ? scope === "all"
        ? "Indian financial year view (Apr–Mar). Compare income, expense, and lent money across years."
        : `${periodLabel} month-by-month drill-down (Apr–Mar).`
      : scope === "all"
        ? "Diwali to Diwali, the way the khatavahi is kept for Chopda Pujan. Compare income, expense, and lent money across Diwali years."
        : `${periodLabel} month-by-month, ${describeDiwaliYearWindow(scope)}.`;

  const chartTabs: {value: ChartView; label: string}[] = [
    {value: "flow", label: "Cash flow"},
    {value: "net", label: "Net & savings"},
    {value: "balance", label: "Balance"},
    {value: "waterfall", label: "Waterfall"},
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-3 px-6 py-5 lg:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="font-serif text-xl">Rokda Cash Flow</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <PeriodToggle
                value={basis}
                onChange={(next) => {
                  setBasis(next);
                  setScope("all");
                }}
                options={[
                  {value: "fy", label: "FY wise"},
                  {value: "diwali", label: "Diwali wise"},
                ]}
              />
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger size="sm" className="min-w-40">
                  <SelectValue placeholder={basis === "fy" ? "Financial year" : "Diwali year"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PeriodToggle value={chartView} onChange={setChartView} options={chartTabs} />
            </div>
          </div>
          <CardDescription className="text-balance">{periodDescription}</CardDescription>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5">
          {[
            {key: "income", label: "Income", tone: "text-emerald-600", value: periodTotals.income},
            {key: "expense", label: "Expense", tone: "text-rose-600", value: periodTotals.expense},
            {
              key: "lentMoney",
              label: "Lent",
              tone: "text-amber-600",
              value: periodTotals.lentMoney,
            },
            {key: "netCash", label: "Net", tone: "text-sky-600", value: periodTotals.netCash},
            {key: "cash", label: "Cash at Home", tone: "text-violet-600", value: totals.cash},
          ].map(({key, label, tone, value}, index) => (
            <div
              key={key}
              className={`flex flex-col justify-center gap-1 border-t px-5 py-4 lg:border-t-0 lg:border-l lg:px-5 lg:py-6 ${
                index % 2 === 1 ? "border-l" : ""
              }`}
            >
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
                {key === "cash" ? " (now)" : ""}
              </span>
              <span className={`text-lg leading-none font-semibold lg:text-xl ${tone}`}>
                {formatInr(value)}
              </span>
              {key === "netCash" && (
                <span className="text-muted-foreground text-[10px]">
                  Save {formatPercent(savingsRate)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-2 py-6 sm:px-6">
        {periodData.length === 0 ? (
          <EmptyChart message="No transaction data for this period." />
        ) : (
          <>
            {chartView === "flow" && (
              <div className="space-y-6">
                <CashFlowGroupedChart data={periodData} dense={scope !== "all"} />
              </div>
            )}

            {chartView === "net" && <NetChangeComboChart data={netChangeData} />}

            {chartView === "balance" && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {scope === "all"
                    ? basis === "fy"
                      ? "Cumulative net cash change at the end of each financial year."
                      : "Cumulative net cash change at the end of each Diwali year."
                    : basis === "fy"
                      ? "Running cash balance through the financial year, starting from opening balance."
                      : "Running cash balance through the Diwali year, starting from the opening balance on Diwali."}
                </p>
                <RunningBalanceChart data={balanceData} />
              </div>
            )}

            {chartView === "waterfall" &&
              (scope === "all" ? (
                <EmptyChart
                  message={
                    basis === "fy"
                      ? "Select a financial year to see the opening → income → expense → lent → closing bridge."
                      : "Select a Diwali year to see the opening → income → expense → lent → closing bridge."
                  }
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    {basis === "fy"
                      ? `Cash bridge for ${periodLabel} — how opening balance moves to closing.`
                      : `Cash bridge for ${periodLabel} — how the balance on Diwali moves to closing before the next Diwali.`}
                  </p>
                  <WaterfallChart data={waterfallData} />
                </div>
              ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
