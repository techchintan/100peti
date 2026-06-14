import {HandCoins, Receipt, TrendingDown, TrendingUp, Wallet} from "lucide-react";

import {PageHeader, SectionNav, StatCard} from "@/components/finance/page-shell";
import {formatInr} from "@/lib/format";
import {wealthSections} from "@/lib/wealth";
import {sanityFetch} from "@/sanity/lib/live";
import {DASHBOARD_TOTALS, ROKDA_TRANSACTIONS} from "@/sanity/queries";
import type {ROKDA_TRANSACTIONSResult} from "@/sanity.types";

import {columns} from "./columns";
import {DataTable} from "./data-table";

export const dynamic = "force-dynamic";

type DashboardTotals = {
  income: number;
  expense: number;
  lentMoney: number;
  cash: number;
};

export default async function RokdaPage() {
  const [{data: transactions}, {data: totals}] = await Promise.all([
    sanityFetch<ROKDA_TRANSACTIONSResult>({
      query: ROKDA_TRANSACTIONS,
      params: {type: "all"},
    }),
    sanityFetch<DashboardTotals>({query: DASHBOARD_TOTALS}),
  ]);

  const summary = {
    income: totals?.income ?? 0,
    expense: totals?.expense ?? 0,
    lentMoney: totals?.lentMoney ?? 0,
    cash: totals?.cash ?? 0,
  };

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Cash"
        title="Rokda Transactions"
        description="Every income, expense, and lent-money record that drives your cash-at-home balance."
        action={{label: "Manage in Studio", href: "/studio/structure/transactions"}}
      />
      <SectionNav items={[...wealthSections]} activeHref="/cash/rokda" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total Income" tone="income" value={formatInr(summary.income)} />
        <StatCard icon={TrendingDown} label="Total Expense" tone="expense" value={formatInr(summary.expense)} />
        <StatCard icon={HandCoins} label="Lent Money" tone="gold" value={formatInr(summary.lentMoney)} />
        <StatCard icon={Wallet} label="Cash at Home" tone="cash" value={formatInr(summary.cash)} />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="size-5 text-zinc-600" />
          <h2 className="font-serif text-xl font-semibold">All Transactions</h2>
        </div>
        <DataTable columns={columns} data={transactions ?? []} />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Rokda | Sudani Family Finance",
  description: "Income, expense, and lent money transaction ledger.",
};
