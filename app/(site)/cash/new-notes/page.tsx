import {Banknote, Layers, Package} from "lucide-react";

import {EmptyState, PageHeader, SectionNav, StatCard} from "@/components/finance/page-shell";
import {formatDate, formatInr} from "@/lib/format";
import {wealthSections, type PortfolioSummary} from "@/lib/wealth";
import {sanityFetch} from "@/sanity/lib/live";
import {CASH_NOTES, PORTFOLIO_SUMMARY} from "@/sanity/queries";

export const dynamic = "force-dynamic";

type CashNote = {
  _id: string;
  denomination: number;
  bundles100?: number;
  bundles50?: number;
  bundles100Count: number;
  looseNotes?: number;
  quantity: number;
  lastCounted?: string;
  notes?: string;
  totalValue: number;
};

type NotesPortfolioSummary = PortfolioSummary & {
  notesBundles100?: number;
  notesBundles50?: number;
};

export default async function NewNotesPage() {
  const [{data: notes}, {data: portfolio}] = await Promise.all([
    sanityFetch<CashNote[]>({query: CASH_NOTES}),
    sanityFetch<NotesPortfolioSummary>({query: PORTFOLIO_SUMMARY}),
  ]);

  const items = notes ?? [];
  const totalNotes = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalBundles100 =
    portfolio?.notesBundles100 ?? items.reduce((sum, item) => sum + item.bundles100Count, 0);
  const totalBundles50 =
    portfolio?.notesBundles50 ?? items.reduce((sum, item) => sum + (item.bundles50 ?? 0), 0);
  const totalValue = portfolio?.notesValue ?? items.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Cash"
        title="New Notes"
        description="Count notes in bundles of 100 or 50, plus any loose notes. Total quantity is calculated automatically."
        action={{label: "Manage in Studio", href: "/studio/structure/cashNotes"}}
      />
      <SectionNav items={[...wealthSections]} activeHref="/cash/new-notes" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Banknote} label="Total Note Value" tone="default" value={formatInr(totalValue)} />
        <StatCard
          icon={Layers}
          label="Total Notes"
          tone="cash"
          value={`${totalNotes.toLocaleString("en-IN")}`}
          hint="100 + 50 bundles + loose"
        />
        <StatCard
          icon={Package}
          label="100-note bundles"
          tone="default"
          value={`${totalBundles100.toLocaleString("en-IN")}`}
          hint="100 notes each"
        />
        <StatCard
          icon={Package}
          label="50-note bundles"
          tone="default"
          value={`${totalBundles50.toLocaleString("en-IN")}`}
          hint="50 notes each"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No new notes yet"
          description="Add denominations in Studio — e.g. ₹500 with 2 bundles of 100, 1 bundle of 50, and 25 loose notes."
          action={{label: "Open Studio", href: "/studio/structure/cashNotes"}}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Denomination</th>
                  <th className="px-5 py-3 font-medium">×100</th>
                  <th className="px-5 py-3 font-medium">×50</th>
                  <th className="px-5 py-3 font-medium">Loose</th>
                  <th className="px-5 py-3 font-medium">Total notes</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Last counted</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-zinc-50/80">
                    <td className="px-5 py-4 font-semibold text-zinc-900">{formatInr(item.denomination)}</td>
                    <td className="px-5 py-4">{item.bundles100Count}</td>
                    <td className="px-5 py-4">{item.bundles50 ?? 0}</td>
                    <td className="px-5 py-4">{item.looseNotes ?? 0}</td>
                    <td className="px-5 py-4 font-medium">{item.quantity.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 font-medium text-emerald-700">{formatInr(item.totalValue)}</td>
                    <td className="px-5 py-4 text-zinc-600">{formatDate(item.lastCounted)}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-zinc-500">{item.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-zinc-50">
                <tr>
                  <td className="px-5 py-4 font-semibold" colSpan={4}>
                    Grand total
                  </td>
                  <td className="px-5 py-4 font-semibold">{totalNotes.toLocaleString("en-IN")} notes</td>
                  <td className="px-5 py-4 text-lg font-semibold text-emerald-700">{formatInr(totalValue)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "New Notes | Sudani Family Finance",
  description: "New notes inventory counted in 100- and 50-note bundles.",
};
