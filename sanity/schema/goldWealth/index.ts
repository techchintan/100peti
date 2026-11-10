import {Gem} from "lucide-react";
import {defineField, defineType} from "sanity";

import {sanityIcon} from "@/sanity/studio/icons";

export const goldWealth = defineType({
  name: "goldWealth",
  title: "Gold Wealth",
  type: "document",
  icon: sanityIcon(Gem),
  groups: [
    {name: "details", title: "Details", default: true},
    {name: "values", title: "Values"},
  ],
  orderings: [
    {
      title: "Current value (high to low)",
      name: "valueDesc",
      by: [{field: "currentValue", direction: "desc"}],
    },
  ],
  fields: [
    defineField({
      name: "itemName",
      title: "Item Name",
      group: "details",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "weightGrams",
      title: "Weight (grams)",
      group: "details",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "purity",
      title: "Purity",
      group: "details",
      type: "string",
      options: {
        list: [
          {title: "24K", value: "24k"},
          {title: "22K", value: "22k"},
          {title: "18K", value: "18k"},
          {title: "Other", value: "other"},
        ],
      },
    }),
    defineField({
      name: "location",
      title: "Location",
      group: "details",
      type: "string",
      description: "e.g. Home locker, Bank locker",
    }),
    defineField({
      name: "purchaseDate",
      title: "Purchase Date",
      group: "details",
      type: "date",
    }),
    defineField({
      name: "purchasePrice",
      title: "Purchase Price (INR)",
      group: "values",
      type: "number",
      validation: (Rule) => Rule.required().min(0).precision(0),
    }),
    defineField({
      name: "currentValue",
      title: "Current Value (INR)",
      group: "values",
      type: "number",
      validation: (Rule) => Rule.required().min(0).precision(0),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      group: "details",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      itemName: "itemName",
      weightGrams: "weightGrams",
      purity: "purity",
      currentValue: "currentValue",
    },
    prepare: ({itemName, weightGrams, purity, currentValue}) => ({
      title: itemName || "Gold item",
      subtitle: [
        weightGrams ? `${weightGrams}g` : null,
        purity?.toUpperCase(),
        currentValue ? `₹${currentValue}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      media: sanityIcon(Gem),
    }),
  },
});
