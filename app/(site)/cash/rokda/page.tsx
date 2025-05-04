import {columns} from "./columns";

import {DataTable} from "./data-table";
import {sanityFetch} from "@/sanity/lib/live";
import {Transactions} from "@/sanity.types";
import {ROKDA_TRANSACTIONS} from "@/sanity/queries";

export default async function RokdaPage() {
  const {data: transactions} = await sanityFetch<Transactions[]>({
    query: ROKDA_TRANSACTIONS,
    params: {
      type: "all",
    },
  });

  return (
    <div className="mx-auto">
      <h1 className="mb-4 font-sans text-2xl font-bold">Rokda Transactions</h1>
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
