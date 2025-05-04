/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {ColumnDef} from "@tanstack/react-table";
import {Transactions} from "@/sanity.types";
import {cn} from "@/lib/utils";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";

export const columns: ColumnDef<Transactions>[] = [
  {
    accessorKey: "transactionDate",
    header: "Transaction Date",
    cell: ({row}) => {
      return <div>{new Date(row.original.transactionDate).toLocaleDateString("en-GB")}</div>;
    },
  },
  {
    accessorKey: "transactionAmount",
    header: "Transaction Amount",
    cell: ({row}) => {
      return (
        <div
          className={cn(
            "text-center font-bold",
            row.original.transactionType === "income" ? "text-green-500" : "text-red-500",
          )}
        >
          {row.original.transactionType === "income" ? "+" : "-"}
          {row.original.transactionAmount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          })}
          /-
        </div>
      );
    },
  },
  {
    accessorKey: "transactionType",
    header: ({column}) => (
      <Button
        className="font-sans font-bold text-base"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Transaction Type
      </Button>
    ),
    cell: ({row}) => {
      return <div className="capitalize text-center">{row.original.transactionType}</div>;
    },
  },
  {
    accessorKey: "isBorrow",
    header: "Is Borrow",
    cell: ({row}) => {
      return row.original.isBorrow ? "Yes" : "No";
    },
  },
  {
    accessorKey: "borrower.name",
    header: "Borrower",
    cell: ({row}: {row: any}) => {
      return <div className="capitalize">{row.original.borrower?.name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "sender.name",
    header: "Sender",
    cell: ({row}: {row: any}) => {
      return <div className="capitalize">{row.original.sender?.name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "receiver.name",
    header: "Receiver",
    cell: ({row}: {row: any}) => {
      return <div className="capitalize">{row.original.receiver?.name || "N/A"}</div>;
    },
  },
  {
    accessorKey: "transactionDescription",
    header: "Transaction Description",
    cell: ({row}) => {
      return (
        <div className="capitalize max-w-[350px] truncate" title={row.original.transactionDescription || "N/A"}>
          {row.original.transactionDescription || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({row}) => {
      return row.original.isBorrow ? (
        <div className="flex items-center gap-2 capitalize">
          <Switch id="is-borrow" checked={row.original.isBorrow} />
        </div>
      ) : (
        <div className="capitalize">No</div>
      );
    },
  },
];
