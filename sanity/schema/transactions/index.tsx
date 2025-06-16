import { defineField } from "sanity";
import { defineType } from "sanity";

export const transactions = defineType({
  name: "transactions",
  title: "Transactions",
  type: "document",
  groups: [
    { name: "details", title: "Details" },
    { name: "borrower", title: "Borrower" },
    { name: "between", title: "Between" },
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
      name: "transactionAmount",
      title: "Transaction Amount",
      group: "details",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "transactionType",
      title: "Transaction Type",
      group: "details",
      type: "string",
      description: "Income or Expense",
      initialValue: () => "income",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Income", value: "income" },
          { title: "Expense", value: "expense" },
        ],
      },
    }),
    defineField({
      name: "isBorrow",
      title: "Is Borrow",
      group: "borrower",
      type: "boolean",
      description: "If the transaction is a borrow, select true",
      initialValue: () => false,
    }),
    defineField({
      name: "borrower",
      title: "Borrower",
      group: "borrower",
      type: "reference",
      to: [{ type: "intermediaries" }],
      hidden: ({ document }) => !document?.isBorrow,
    }),
    defineField({
      name: "sender",
      title: "Sender",
      description: "Who is sending the money",
      group: "between",
      type: "reference",
      to: [{ type: "intermediaries" }],
    }),
    defineField({
      name: "receiver",
      title: "Receiver",
      description: "Who is receiving the money",
      group: "between",
      type: "reference",
      to: [{ type: "intermediaries" }],
    }),
    defineField({
      name: "transactionDescription",
      title: "Transaction Description",
      group: "details",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: {
      _id: "_id",
      date: "transactionDate",
      amount: "transactionAmount",
      sender: "sender.name",
      receiver: "receiver.name",
      transactionType: "transactionType",
    },
    prepare: (value) => {
      const { _id, date, amount, sender, receiver, transactionType } = value;

      return {
        _id: _id,
        title: `${transactionType === "income" ? "+" : "-"} ${amount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        })}`,
        subtitle: `On ${new Date(date).toLocaleDateString("en-GB")} b/w ${sender} and ${receiver}`,
        description: transactionType,
        media:
          transactionType === "income" ? (
            <svg
              width="64px"
              height="64px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z"
                  stroke="#008000"
                  strokeWidth="2"
                ></path>{" "}
                <path
                  d="M12 17L9.12186 14.1219V14.1219C9.07689 14.0769 9.11206 13.9992 9.17562 13.9971C13.9993 13.8351 13.9408 7 9 7H15"
                  stroke="#008000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
                <path
                  d="M9 10.5H15"
                  stroke="#008000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
          ) : (
            <svg
              width="64px"
              height="64px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z"
                  stroke="#FF0000"
                  strokeWidth="2"
                ></path>{" "}
                <path
                  d="M12 17L9.12186 14.1219V14.1219C9.07689 14.0769 9.11206 13.9992 9.17562 13.9971C13.9993 13.8351 13.9408 7 9 7H15"
                  stroke="#FF0000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
                <path
                  d="M9 10.5H15"
                  stroke="#FF0000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
          ),
      };
    },
  },
});
