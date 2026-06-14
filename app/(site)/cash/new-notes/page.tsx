import {Banknote, Layers, MapPin} from "lucide-react";

import {EmptyState, PageHeader, SectionNav, StatCard} from "@/components/finance/page-shell";
import {formatDate, formatInr} from "@/lib/format";
import {wealthSections} from "@/lib/wealth";
import {sanityFetch} from "@/sanity/lib/live";
import {CASH_NOTES, PORTFOLIO_SUMMARY} from "@/sanity/queries";
import type {PortfolioSummary} from "@/lib/wealth";

export const dynamic = "force-dynamic";

type CashNote = {
  _id: string;
  denomination: number;
  quantity: number;
  location?: string;
  lastCounted?: string;
  notes?: string;
  totalValue: number;
};

export default async function NewNotesPage() {
  const [{data: notes}, {data: portfolio}] = await Promise.all([
    sanityFetch<CashNote[]>({query: CASH_NOTES}),
    sanityFetch<PortfolioSummary>({query: PORTFOLIO_SUMMARY}),
  ]);

  const items = notes ?? [];
  const totalNotes = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = portfolio?.notesValue ?? items.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Cash"
        title="New Notes"
        description="Track currency notes by denomination, quantity, and where they are stored."
        action={{label: "Manage in Studio", href: "/studio/structure/cashNotes"}}
      />
      <SectionNav items={[...wealthSections]} activeHref="/cash/new-notes" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Banknote} label="Total Note Value" tone="default" value={formatInr(totalValue)} />
        <StatCard icon={Layers} label="Total Notes" tone="cash" value={`${totalNotes}`} hint="Sum of all quantities" />
        <StatCard
          icon={MapPin}
          label="Locations"
          tone="default"
          value={`${new Set(items.map((i) => i.location).filter(Boolean)).size}`}
          hint="Unique storage locations"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No New Notes yet"
          description="Add note denominations in Sanity Studio — e.g. ₹500 × 20 in home locker."
          action={{label: "Open Studio", href: "/studio/structure/cashNotes"}}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Denomination</th>
                  <th className="px-5 py-3 font-medium">Quantity</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Last Counted</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-zinc-50/80">
                    <td className="px-5 py-4 font-semibold text-zinc-900">{formatInr(item.denomination)}</td>
                    <td className="px-5 py-4">{item.quantity}</td>
                    <td className="px-5 py-4 font-medium text-emerald-700">{formatInr(item.totalValue)}</td>
                    <td className="px-5 py-4 text-zinc-600">{item.location || "—"}</td>
                    <td className="px-5 py-4 text-zinc-600">{formatDate(item.lastCounted)}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-zinc-500">{item.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-zinc-50">
                <tr>
                  <td className="px-5 py-4 font-semibold" colSpan={2}>
                    Grand Total
                  </td>
                  <td className="px-5 py-4 text-lg font-semibold text-emerald-700">{formatInr(totalValue)}</td>
                  <td colSpan={3} />
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
  description: "New notes inventory and valuation.",
};
