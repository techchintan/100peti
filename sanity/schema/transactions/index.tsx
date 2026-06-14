"use client";

import {defineField, defineType} from "sanity";

import {StudioIcons} from "@/sanity/studio/icons";
import {TransactionPreview} from "@/sanity/studio/TransactionPreview";

const formatInr = (amount?: number) =>
  (amount ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export const transactions = defineType({
  name: "transactions",
  title: "Transactions",
  type: "document",
  icon: StudioIcons.receipt,
  __experimental_formPreviewTitle: false,
  components: {
    preview: TransactionPreview,
  },
  groups: [
    {name: "details", title: "Details", default: true},
    {name: "lentMoney", title: "Lent Money"},
    {name: "between", title: "Between"},
  ],
  orderings: [
    {
      title: "Date (newest first)",
      name: "dateDesc",
      by: [{field: "transactionDate", direction: "desc"}],
    },
    {
      title: "Date (oldest first)",
      name: "dateAsc",
      by: [{field: "transactionDate", direction: "asc"}],
    },
    {
      title: "Amount (high to low)",
      name: "amountDesc",
      by: [{field: "transactionAmount", direction: "desc"}],
    },
    {
      title: "Amount (low to high)",
      name: "amountAsc",
      by: [{field: "transactionAmount", direction: "asc"}],
    },
  ],
  fields: [
    defineField({
      name: "transactionDate",
      title: "Transaction Date",
      group: "details",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "transactionType",
      title: "Transaction Type",
      group: "details",
      type: "string",
      description: "Income adds cash. Expense removes cash.",
      initialValue: () => "income",
      validation: (Rule) => Rule.required(),
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          {title: "Income", value: "income"},
          {title: "Expense", value: "expense"},
        ],
      },
    }),
    defineField({
      name: "transactionAmount",
      title: "Amount (INR)",
      group: "details",
      type: "number",
      description: "Enter amount in rupees without commas.",
      validation: (Rule) => Rule.required().positive().precision(0),
    }),
    defineField({
      name: "transactionDescription",
      title: "Description",
      group: "details",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "isBorrow",
      title: "Is Lent Money",
      group: "lentMoney",
      type: "boolean",
      description: "Money lent to someone. Counts under Lent Money on the dashboard.",
      initialValue: () => false,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (value && context.document?.transactionType !== "expense") {
            return "Lent money must use transaction type Expense";
          }
          return true;
        }),
    }),
    defineField({
      name: "borrower",
      title: "Lent Money to",
      group: "lentMoney",
      type: "reference",
      to: [{type: "intermediaries"}],
      hidden: ({document}) => !document?.isBorrow,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.isBorrow && !value) {
            return "Select who received the lent money";
          }
          return true;
        }),
    }),
    defineField({
      name: "sender",
      title: "Sender",
      description: "Who is sending the money",
      group: "between",
      type: "reference",
      to: [{type: "intermediaries"}],
    }),
    defineField({
      name: "receiver",
      title: "Receiver",
      description: "Who is receiving the money",
      group: "between",
      type: "reference",
      to: [{type: "intermediaries"}],
    }),
  ],
  preview: {
    select: {
      transactionDate: "transactionDate",
      transactionAmount: "transactionAmount",
      sender: "sender.name",
      receiver: "receiver.name",
      borrower: "borrower.name",
      transactionType: "transactionType",
      isBorrow: "isBorrow",
      transactionDescription: "transactionDescription",
    },
    prepare: ({
      transactionDate,
      transactionAmount,
      sender,
      receiver,
      borrower,
      transactionType,
      isBorrow,
      transactionDescription,
    }) => {
      const isLent = Boolean(isBorrow);
      const prefix = transactionType === "income" ? "+" : "-";
      const parties = isLent
        ? `Lent to ${borrower ?? "unknown"}`
        : `Between ${sender ?? "?"} → ${receiver ?? "?"}`;

      return {
        title: `${prefix} ${formatInr(transactionAmount)}`,
        subtitle: `${transactionDate ? new Date(transactionDate).toLocaleDateString("en-IN") : "No date"} · ${parties}`,
        media: isLent
          ? StudioIcons.lentPreview
          : transactionType === "income"
            ? StudioIcons.incomePreview
            : StudioIcons.expensePreview,
        transactionDate,
        transactionAmount,
        sender,
        receiver,
        borrower,
        transactionType,
        isBorrow,
        transactionDescription,
      };
    },
  },
});
