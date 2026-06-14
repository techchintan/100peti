import {Banknote} from "lucide-react";
import {defineField, defineType} from "sanity";

import {sanityIcon} from "@/sanity/studio/icons";

import {
  ComputedQuantityInput,
  formatBundleBreakdown,
  getNoteQuantity,
  MAX_LOOSE_NOTES,
  NOTES_PER_BUNDLE_100,
  NOTES_PER_BUNDLE_50,
} from "./ComputedQuantity";

export const NOTE_DENOMINATIONS = [10, 20, 50, 100, 200, 500] as const;

export const cashNotes = defineType({
  name: "cashNotes",
  title: "New Notes",
  type: "document",
  icon: sanityIcon(Banknote),
  orderings: [
    {
      title: "Denomination (high to low)",
      name: "denominationDesc",
      by: [{field: "denomination", direction: "desc"}],
    },
  ],
  fields: [
    defineField({
      name: "denomination",
      title: "Denomination (INR)",
      type: "number",
      description: "Select the note value.",
      initialValue: () => 100,
      validation: (Rule) => Rule.required(),
      options: {
        layout: "radio",
        direction: "horizontal",
        list: NOTE_DENOMINATIONS.map((value) => ({
          title: `₹${value}`,
          value,
        })),
      },
    }),
    defineField({
      name: "bundles100",
      title: "Bundles (100 notes)",
      type: "number",
      description: `Full bundles of ${NOTES_PER_BUNDLE_100} notes each.`,
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
    defineField({
      name: "bundles50",
      title: "Bundles (50 notes)",
      type: "number",
      description: `Half bundles of ${NOTES_PER_BUNDLE_50} notes each.`,
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0).integer(),
    }),
    defineField({
      name: "looseNotes",
      title: "Loose notes",
      type: "number",
      description: `Individual notes outside bundles (0–${MAX_LOOSE_NOTES}). Use a 50-note bundle for 50+ notes.`,
      initialValue: 0,
      validation: (Rule) =>
        Rule.required()
          .min(0)
          .integer()
          .max(MAX_LOOSE_NOTES)
          .error(`Loose notes must be 0–${MAX_LOOSE_NOTES}. Use a 50-note bundle for larger counts.`),
    }),
    defineField({
      name: "computedQuantity",
      title: "Total notes (auto)",
      type: "number",
      readOnly: true,
      components: {
        input: ComputedQuantityInput,
      },
    }),
    defineField({
      name: "lastCounted",
      title: "Last Counted",
      type: "date",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      denomination: "denomination",
      bundles100: "bundles100",
      bundles50: "bundles50",
      bundles: "bundles",
      looseNotes: "looseNotes",
    },
    prepare: ({denomination, bundles100, bundles50, bundles, looseNotes}) => {
      const count100 = bundles100 ?? bundles ?? 0;
      const count50 = bundles50 ?? 0;
      const total = getNoteQuantity(count100, count50, looseNotes);
      const totalValue = denomination * total;

      return {
        title: `₹${denomination} · ${total} notes = ₹${totalValue}/-`,
        subtitle: formatBundleBreakdown(count100, count50, looseNotes ?? 0),
        media: sanityIcon(Banknote),
      };
    },
  },
});
