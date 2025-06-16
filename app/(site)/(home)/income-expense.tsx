"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const chartConfig = {
  income: {
    label: "Income",
    color: "#008000",
  },
  expense: {
    label: "Expense",
    color: "#ff0000",
  },
  borrow: {
    label: "Borrow",
    color: "#ffa500",
  },
} satisfies ChartConfig;

export function IncomeExpense({
  chartData,
}: {
  chartData: Array<{ month: string; income: number; expense: number; borrow: number }>;
}) {
  const total = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        return {
          income: acc.income + curr.income,
          expense: acc.expense + curr.expense,
          borrow: acc.borrow + curr.borrow,
          cash: acc.income - acc.expense - acc.borrow,
        };
      },
      { income: 0, expense: 0, borrow: 0, cash: 0 },
    );
  }, [chartData]);

  const buttons = [
    { key: "income", label: "Income" },
    { key: "borrow", label: "Borrow" },
    { key: "expense", label: "Expense" },
    { key: "cash", label: "Cash at Home" },
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
          {buttons.map(({ key, label }) => {
            const chart = key as keyof typeof chartConfig;

            return (
              <button
                key={chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              >
                <span className="text-muted-foreground text-sm">
                  {label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                  /-
                </span>
              </button>
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
            <Bar dataKey="borrow" fill="var(--color-borrow)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
