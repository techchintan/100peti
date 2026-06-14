import {Transactions} from "@/sanity.types";
import {sanityFetch} from "@/sanity/lib/live";
import {DASHBOARD_TOTALS, ROKDA_TRANSACTIONS} from "@/sanity/queries";
import {IncomeExpense} from "./income-expense";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

type DashboardTotals = {
  income: number;
  expense: number;
  lentMoney: number;
  cash: number;
};

export default async function HomePage() {
  const [{data: transactions}, {data: totals}] = await Promise.all([
    sanityFetch<Transactions[]>({
      query: ROKDA_TRANSACTIONS,
      params: {type: "all"},
      options: {cache: "no-store", next: {revalidate: 0, tags: []}},
    }),
    sanityFetch<DashboardTotals>({
      query: DASHBOARD_TOTALS,
      options: {cache: "no-store", next: {revalidate: 0, tags: []}},
    }),
  ]);

  const summary = {
    income: totals?.income ?? 0,
    expense: totals?.expense ?? 0,
    lentMoney: totals?.lentMoney ?? 0,
    cash: totals?.cash ?? 0,
  };

  const chartData = transactions
    ?.reduce(
      (acc, transaction) => {
        const date = new Date(transaction.transactionDate);
        const monthYear = `${date.toLocaleDateString("en-IN", {
          month: "short",
        })} ${date.getFullYear()}`;

        const existingMonth = acc.find((item) => item.month === monthYear);

        if (existingMonth) {
          if (transaction.transactionType === "income") {
            existingMonth.income += transaction.transactionAmount;
          } else if (transaction.transactionType === "expense") {
            if (transaction.isBorrow) {
              existingMonth.lentMoney += transaction.transactionAmount;
            } else {
              existingMonth.expense += transaction.transactionAmount;
            }
          }
        } else {
          acc.push({
            month: monthYear,
            income: transaction.transactionType === "income" ? transaction.transactionAmount : 0,
            expense:
              transaction.transactionType === "expense" && !transaction.isBorrow
                ? transaction.transactionAmount
                : 0,
            lentMoney:
              transaction.transactionType === "expense" && transaction.isBorrow
                ? transaction.transactionAmount
                : 0,
          });
        }

        return acc;
      },
      [] as Array<{month: string; income: number; expense: number; lentMoney: number}>,
    )
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <section className="bg-white font-sans">
      <h2 className="text-secondary mb-4 text-3xl font-light italic">
        Wealth Management Dashboard
      </h2>
      <IncomeExpense chartData={chartData} totals={summary} />
    </section>
  );
}

export async function generateMetadata() {
  return {
    title: "Sudani Family",
    description: "Sudani Family Wealth management dashboard",
  };
}
