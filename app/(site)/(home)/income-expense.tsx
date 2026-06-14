"use client";

import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatInr} from "@/lib/format";

export const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142 71% 45%)",
  },
  expense: {
    label: "Expense",
    color: "hsl(0 84% 60%)",
  },
  lentMoney: {
    label: "Lent Money",
    color: "hsl(38 92% 50%)",
  },
} satisfies ChartConfig;

export function IncomeExpense({
  chartData,
  totals,
}: {
  chartData: Array<{month: string; income: number; expense: number; lentMoney: number}>;
  totals: {income: number; expense: number; lentMoney: number; cash: number};
}) {
  const buttons = [
    {key: "income", label: "Income", tone: "text-emerald-600"},
    {key: "lentMoney", label: "Lent Money", tone: "text-amber-600"},
    {key: "expense", label: "Expense", tone: "text-rose-600"},
    {key: "cash", label: "Cash at Home", tone: "text-violet-600"},
  ] as const;

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 lg:py-6">
          <CardTitle className="font-serif text-xl">Monthly Cash Flow</CardTitle>
          <CardDescription className="text-balance">
            Rokda income and expenses by month. Gold and trading are tracked separately.
          </CardDescription>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {buttons.map(({key, label, tone}) => (
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
      <CardContent className="px-2 py-6 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-video min-h-[260px] w-full max-w-none">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => formatInr(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
            <Bar dataKey="lentMoney" fill="var(--color-lentMoney)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
