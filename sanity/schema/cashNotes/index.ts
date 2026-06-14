import {Banknote} from "lucide-react";
import {defineField, defineType} from "sanity";

import {sanityIcon} from "@/sanity/studio/icons";

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
      description: "Note value — e.g. 500, 200, 100",
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      validation: (Rule) => Rule.required().min(0).integer(),
      initialValue: 0,
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Where these notes are kept — e.g. Home safe, Locker",
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
      quantity: "quantity",
      location: "location",
    },
    prepare: ({denomination, quantity, location}) => ({
      title: `₹${denomination} × ${quantity ?? 0}`,
      subtitle: location || "No location",
      media: sanityIcon(Banknote),
    }),
  },
});
