import type {ChartConfig} from "@/components/ui/chart";

export const cashFlowChartConfig = {
  income: {label: "Income", color: "hsl(142 71% 45%)"},
  expense: {label: "Expense", color: "hsl(0 84% 60%)"},
  lentMoney: {label: "Lent Money", color: "hsl(38 92% 50%)"},
  netCash: {label: "Net Cash", color: "hsl(262 83% 58%)"},
} satisfies ChartConfig;
