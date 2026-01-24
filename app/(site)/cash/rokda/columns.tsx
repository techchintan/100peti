"use client";

import {ColumnDef} from "@tanstack/react-table";
import type {ROKDA_TRANSACTIONSResult} from "@/sanity.types";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {CheckIcon} from "lucide-react";
import {toast} from "sonner";

type RokdaRow = ROKDA_TRANSACTIONSResult[number];

export const columns: ColumnDef<RokdaRow>[] = [
  {
    accessorKey: "transactionDate",
    header: "Date",
    cell: ({row}) => {
      return <div>{new Date(row.original.transactionDate).toLocaleDateString("en-GB")}</div>;
    },
  },
  {
    accessorKey: "transactionAmount",
    header: "Amount",
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
        className="font-sans text-base font-bold"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
      </Button>
    ),
    cell: ({row}) => {
      return <div className="text-center capitalize">{row.original.transactionType}</div>;
    },
  },
  {
    accessorKey: "isBorrow",
    header: "Is Lent Money?",
    cell: ({row}) => {
      return row.original.isBorrow ? "Yes" : "No";
    },
  },
  {
    accessorKey: "borrower.name",
    header: "Lent Money to",
    cell: ({row}) => <div className="capitalize">{row.original.borrower?.name || "N/A"}</div>,
  },
  {
    accessorKey: "sender.name",
    header: "Sender",
    cell: ({row}) => <div className="capitalize">{row.original.sender?.name || "N/A"}</div>,
  },
  {
    accessorKey: "receiver.name",
    header: "Receiver",
    cell: ({row}) => <div className="capitalize">{row.original.receiver?.name || "N/A"}</div>,
  },
  {
    accessorKey: "transactionDescription",
    header: "Note",
    cell: ({row}) => {
      return (
        <div
          className="max-w-[320px] truncate capitalize"
          title={row.original.transactionDescription || "N/A"}
        >
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <CheckIcon className="cursor-pointer text-green-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark this transaction as not lent money. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/transactions", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          _id: row.original._id,
                          isBorrow: false,
                          transactionType: "income",
                        }),
                      });

                      if (response.ok) {
                        toast.success("Transaction updated successfully!");
                      }
                    } catch (error) {
                      console.error("Failed to update transaction:", error);
                      toast.error("Failed to update transaction");
                    }
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="capitalize">No</div>
      );
    },
  },
];
