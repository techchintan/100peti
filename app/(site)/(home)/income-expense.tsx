"use client";

import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export const chartConfig = {
  income: {
    label: "Income",
    color: "#008000",
  },
  expense: {
    label: "Expense",
    color: "#ff0000",
  },
  lentMoney: {
    label: "Lent Money",
    color: "#ffa500",
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
    {key: "income", label: "Income"},
    {key: "lentMoney", label: "Lent Money"},
    {key: "expense", label: "Expense"},
    {key: "cash", label: "Cash at Home"},
  ];

  return (
    <Card className="max-h-[800px] min-h-[300px] max-w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Rupee-wise Income and Expense (Monthly)</CardTitle>
          <CardDescription className="text-balance">
            Displaying only income and expenses related to money, excluding gold and trading
            investments.
          </CardDescription>
        </div>
        <div className="flex font-sans">
          {buttons.map(({key, label}) => {
            const chart = key as keyof typeof chartConfig;

            return (
              <div
                key={chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              >
                <span className="text-muted-foreground text-sm">{label}</span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {totals[key as keyof typeof totals].toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                  /-
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="max-h-[500px] min-h-[200px] w-full max-w-7xl font-serif"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                })
              }
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
