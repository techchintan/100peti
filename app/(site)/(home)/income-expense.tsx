"use client";

import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {useMemo} from "react";

import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Transactions} from "@/sanity.types";

const chartConfig = {
  income: {
    label: "Income",
    color: "#008000",
  },
  expense: {
    label: "Expense",
    color: "#ff0000",
  },
} satisfies ChartConfig;

export function IncomeExpense({
  chartData,
  transactions,
}: {
  chartData: Array<{month: string; income: number; expense: number}>;
  transactions: Transactions[];
}) {
  const total = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        return {
          income: acc.income + curr.income,
          expense: acc.expense + curr.expense,
          balance: acc.balance + (curr.income - curr.expense),
        };
      },
      {income: 0, expense: 0, balance: 0},
    );
  }, [chartData]);

  const totalBorrow = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.isBorrow) {
        return acc + curr.transactionAmount;
      }
      return acc;
    }, 0);
  }, [transactions]);

  const buttons = [
    {key: "income", label: "Income"},
    {key: "expense", label: "Expense"},
    {key: "balance", label: "Balance"},
    {key: "borrow", label: "Borrow"},
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
            const chart = key as keyof typeof chartConfig | "balance";
            const value =
              key === "borrow"
                ? totalBorrow
                : key === "cash"
                  ? totalBorrow + total.income - total.expense
                  : total[key as keyof typeof total];

            return (
              <button
                key={chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              >
                <span className="text-muted-foreground text-sm">
                  {chartConfig[chart as keyof typeof chartConfig]?.label ?? label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {value.toLocaleString("en-IN", {
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
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
