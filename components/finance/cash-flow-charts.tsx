"use client";

import {useMemo, useState} from "react";
import {Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatInr} from "@/lib/format";
import type {CashFlowPeriod} from "@/lib/finance/chart-data";
import {cashFlowChartConfig} from "@/lib/finance/chart-theme";
import type {DashboardTotals} from "@/lib/finance/types";

import {PeriodToggle} from "./chart-shell";

const cashFlowConfig = cashFlowChartConfig;

type ViewMode = "year" | "month";

function CashFlowChart({data, view}: {data: CashFlowPeriod[]; view: ViewMode}) {
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
          interval={view === "month" && data.length > 12 ? "preserveStartEnd" : 0}
          angle={view === "month" && data.length > 8 ? -35 : 0}
          textAnchor={view === "month" && data.length > 8 ? "end" : "middle"}
          height={view === "month" && data.length > 8 ? 56 : 30}
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

function NetCashChart({data}: {data: CashFlowPeriod[]}) {
  return (
    <ChartContainer config={cashFlowConfig} className="aspect-2/1 min-h-[220px] w-full max-w-none">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatInr(v)} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatInr(Number(value))}
              labelFormatter={(label) => `Period: ${label}`}
            />
          }
        />
        <Bar dataKey="netCash" radius={4}>
          {data.map((entry) => (
            <Cell
              key={entry.sortKey}
              fill={entry.netCash >= 0 ? "var(--color-income)" : "var(--color-expense)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function CashFlowCharts({
  yearlyData,
  monthlyData,
  totals,
}: {
  yearlyData: CashFlowPeriod[];
  monthlyData: CashFlowPeriod[];
  totals: DashboardTotals;
}) {
  const [view, setView] = useState<ViewMode>("year");
  const chartData = view === "year" ? yearlyData : monthlyData;

  const periodTotals = useMemo(
    () =>
      chartData.reduce(
        (acc, row) => ({
          income: acc.income + row.income,
          expense: acc.expense + row.expense,
          lentMoney: acc.lentMoney + row.lentMoney,
          netCash: acc.netCash + row.netCash,
        }),
        {income: 0, expense: 0, lentMoney: 0, netCash: 0},
      ),
    [chartData],
  );

  const summaryButtons = [
    {key: "income", label: "Income", tone: "text-emerald-600"},
    {key: "lentMoney", label: "Lent Money", tone: "text-amber-600"},
    {key: "expense", label: "Expense", tone: "text-rose-600"},
    {key: "cash", label: "Cash at Home", tone: "text-violet-600"},
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 lg:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-3 px-6 py-5 lg:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="font-serif text-xl">
                {view === "year" ? "Yearly Cash Flow" : "Monthly Cash Flow"}
              </CardTitle>
              <PeriodToggle
                value={view}
                onChange={setView}
                options={[
                  {value: "year", label: "Yearly"},
                  {value: "month", label: "Monthly"},
                ]}
              />
            </div>
            <CardDescription className="text-balance">
              {view === "year"
                ? "Income, expense, and lent money grouped by calendar year."
                : "Month-by-month breakdown of rokda transactions."}
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {summaryButtons.map(({key, label, tone}) => (
              <div
                key={key}
                className="flex flex-col justify-center gap-1 border-t px-5 py-4 even:border-l lg:border-t-0 lg:border-l lg:px-6 lg:py-6"
              >
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {label}
                </span>
                <span className={`text-lg leading-none font-semibold lg:text-2xl ${tone}`}>
                  {formatInr(totals[key])}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-2 py-6 sm:px-6">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No transaction data to chart yet.</p>
          ) : (
            <>
              <CashFlowChart data={chartData} view={view} />
              <div className="text-muted-foreground flex flex-wrap gap-4 border-t pt-4 text-xs sm:text-sm">
                <span>
                  Shown period income:{" "}
                  <strong className="text-emerald-600">{formatInr(periodTotals.income)}</strong>
                </span>
                <span>
                  Expense: <strong className="text-rose-600">{formatInr(periodTotals.expense)}</strong>
                </span>
                <span>
                  Lent: <strong className="text-amber-600">{formatInr(periodTotals.lentMoney)}</strong>
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border shadow-sm">
        <CardHeader className="border-b px-6 py-5">
          <CardTitle className="font-serif text-xl">
            {view === "year" ? "Yearly Net Cash Change" : "Monthly Net Cash Change"}
          </CardTitle>
          <CardDescription>
            Income minus expense minus lent money for each {view === "year" ? "year" : "month"}. Green = retained,
            red = net outflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 py-6 sm:px-6">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No data available.</p>
          ) : (
            <NetCashChart data={chartData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
