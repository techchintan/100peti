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
  buildFinancialYearCashFlow,
  buildFinancialYearMonthlyCashFlow,
  buildFinancialYearWaterfall,
  buildFyEndBalanceTrend,
  buildNetChangePeriods,
  buildRunningBalance,
  filterTransactionsBeforeDate,
  getFinancialYearOptions,
  savingsRateFromTotals,
  computeCashBalanceFromTransactions,
  type CashFlowPeriod,
  type CashFlowTransaction,
  type WaterfallBar,
} from "@/lib/finance/chart-data";
import {cashFlowChartConfig} from "@/lib/finance/chart-theme";
import {
  formatFinancialYearLabel,
  getFinancialYearStartDate,
} from "@/lib/finance/financial-year";
import type {DashboardTotals} from "@/lib/finance/types";

import {EmptyChart, PeriodToggle} from "./chart-shell";

const cashFlowConfig = cashFlowChartConfig;

type ChartView = "flow" | "net" | "balance" | "waterfall";
type FyScope = "all" | string;

function CashFlowGroupedChart({data, dense}: {data: CashFlowPeriod[]; dense?: boolean}) {
  return (
    <ChartContainer config={cashFlowConfig} className="aspect-video min-h-[280px] w-full max-w-none">
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
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
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
    <ChartContainer config={cashFlowConfig} className="aspect-video min-h-[280px] w-full max-w-none">
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
    <ChartContainer config={cashFlowConfig} className="aspect-video min-h-[260px] w-full max-w-none">
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
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
    <ChartContainer config={cashFlowConfig} className="aspect-video min-h-[280px] w-full max-w-none">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const row = item.payload as WaterfallBar;
                return (
                  <div className="space-y-1 text-right">
                    <div className="font-mono font-medium">{formatInr(Number(value))}</div>
                    <div className="text-muted-foreground text-[10px]">Total {formatInr(row.total)}</div>
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
  const [fyScope, setFyScope] = useState<FyScope>(defaultFinancialYear);
  const [chartView, setChartView] = useState<ChartView>("flow");

  const fyOptions = useMemo(() => getFinancialYearOptions(transactions), [transactions]);

  const periodData = useMemo(() => {
    if (fyScope === "all") {
      return buildFinancialYearCashFlow(transactions);
    }
    return buildFinancialYearMonthlyCashFlow(transactions, fyScope);
  }, [transactions, fyScope]);

  const periodTotals = useMemo(() => aggregateCashFlowTotals(periodData), [periodData]);
  const savingsRate = savingsRateFromTotals(periodTotals);

  const netChangeData = useMemo(() => buildNetChangePeriods(periodData), [periodData]);

  const balanceData = useMemo(() => {
    if (fyScope === "all") {
      return buildFyEndBalanceTrend(buildFinancialYearCashFlow(transactions));
    }
    const opening = computeCashBalanceFromTransactions(
      filterTransactionsBeforeDate(transactions, getFinancialYearStartDate(fyScope)),
    );
    return buildRunningBalance(buildFinancialYearMonthlyCashFlow(transactions, fyScope), opening);
  }, [transactions, fyScope]);

  const waterfallData = useMemo(
    () => (fyScope === "all" ? [] : buildFinancialYearWaterfall(transactions, fyScope)),
    [transactions, fyScope],
  );

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
              <Select value={fyScope} onValueChange={setFyScope}>
                <SelectTrigger size="sm" className="min-w-36">
                  <SelectValue placeholder="Financial year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  {fyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PeriodToggle value={chartView} onChange={setChartView} options={chartTabs} />
            </div>
          </div>
          <CardDescription className="text-balance">
            {fyScope === "all"
              ? "Indian financial year view (Apr–Mar). Compare income, expense, and lent money across years."
              : `${formatFinancialYearLabel(fyScope)} month-by-month drill-down (Apr–Mar).`}
          </CardDescription>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5">
          {[
            {key: "income", label: "Income", tone: "text-emerald-600", value: periodTotals.income},
            {key: "expense", label: "Expense", tone: "text-rose-600", value: periodTotals.expense},
            {key: "lentMoney", label: "Lent", tone: "text-amber-600", value: periodTotals.lentMoney},
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
                <CashFlowGroupedChart data={periodData} dense={fyScope !== "all"} />
              </div>
            )}

            {chartView === "net" && <NetChangeComboChart data={netChangeData} />}

            {chartView === "balance" && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {fyScope === "all"
                    ? "Cumulative net cash change at the end of each financial year."
                    : "Running cash balance through the financial year, starting from opening balance."}
                </p>
                <RunningBalanceChart data={balanceData} />
              </div>
            )}

            {chartView === "waterfall" &&
              (fyScope === "all" ? (
                <EmptyChart message="Select a financial year to see the opening → income → expense → lent → closing bridge." />
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Cash bridge for {formatFinancialYearLabel(fyScope)} — how opening balance moves to closing.
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
