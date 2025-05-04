import {Transactions} from "@/sanity.types";
import {sanityFetch} from "@/sanity/lib/live";
import {ROKDA_TRANSACTIONS} from "@/sanity/queries";
import {IncomeExpense} from "./income-expense";

export default async function HomePage() {
  const {data: transactions} = await sanityFetch<Transactions[]>({
    query: ROKDA_TRANSACTIONS,
    params: {
      type: "all",
    },
  });

  const chartData = transactions?.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthYear = `${date.toLocaleDateString("en-GB", {
        month: "long",
      })} ${date.getFullYear()}`;

      const existingMonth = acc.find((item) => item.month === monthYear);

      if (existingMonth) {
        if (transaction.transactionType === "income") {
          existingMonth.income += transaction.transactionAmount;
        } else {
          existingMonth.expense += transaction.transactionAmount;
        }
      } else {
        acc.push({
          month: monthYear,
          income: transaction.transactionType === "income" ? transaction.transactionAmount : 0,
          expense: transaction.transactionType === "expense" ? transaction.transactionAmount : 0,
        });
      }

      return acc;
    },
    [] as Array<{month: string; income: number; expense: number}>,
  );

  return (
    <section className="bg-white font-sans">
      <h2 className="text-secondary mb-4 text-3xl font-light italic">
        Wealth Management Dashboard
      </h2>
      <IncomeExpense chartData={chartData} transactions={transactions} />
    </section>
  );
}

export async function generateMetadata() {
  return {
    title: "Sudani Family",
    description: "Sudani Family Wealth management dashboard",
  };
}
