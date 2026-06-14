import {LineChart} from "lucide-react";
import {defineField, defineType} from "sanity";

import {sanityIcon} from "@/sanity/studio/icons";

export const tradingInvestment = defineType({
  name: "tradingInvestment",
  title: "Trading & Investment",
  type: "document",
  icon: sanityIcon(LineChart),
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
      name: "name",
      title: "Name / Symbol",
      group: "details",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "platform",
      title: "Platform / Broker",
      group: "details",
      type: "string",
      description: "e.g. Zerodha, Groww, Mutual Fund AMC",
    }),
    defineField({
      name: "assetType",
      title: "Asset Type",
      group: "details",
      type: "string",
      options: {
        list: [
          {title: "Stock", value: "stock"},
          {title: "Mutual Fund", value: "mutual-fund"},
          {title: "ETF", value: "etf"},
          {title: "Bond / FD", value: "bond"},
          {title: "Other", value: "other"},
        ],
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      group: "details",
      type: "string",
      initialValue: "active",
      options: {
        list: [
          {title: "Active", value: "active"},
          {title: "Sold / Closed", value: "sold"},
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "purchaseDate",
      title: "Purchase Date",
      group: "details",
      type: "date",
    }),
    defineField({
      name: "investedAmount",
      title: "Invested Amount (INR)",
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
      name: "name",
      platform: "platform",
      currentValue: "currentValue",
      status: "status",
    },
    prepare: ({name, platform, currentValue, status}) => ({
      title: name || "Unnamed holding",
      subtitle: [platform, status === "sold" ? "Sold" : null, currentValue ? `₹${currentValue}` : null]
        .filter(Boolean)
        .join(" · "),
      media: sanityIcon(LineChart),
    }),
  },
});
