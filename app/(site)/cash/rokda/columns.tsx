"use client";

import {ColumnDef} from "@tanstack/react-table";
import {CheckIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

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
import {Button} from "@/components/ui/button";
import {formatDate, formatInr} from "@/lib/format";
import {cn} from "@/lib/utils";
import type {ROKDA_TRANSACTIONSResult} from "@/sanity.types";

type RokdaRow = ROKDA_TRANSACTIONSResult[number];

function MarkRepaidButton({row}: {row: RokdaRow}) {
  const router = useRouter();

  if (!row.isBorrow) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CheckIcon className="size-4 text-emerald-600" />
          Mark repaid
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark as repaid?</AlertDialogTitle>
          <AlertDialogDescription>
            This converts the lent-money entry into income and updates your cash balance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              try {
                const response = await fetch("/api/transactions", {
                  method: "POST",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify({
                    _id: row._id,
                    isBorrow: false,
                    transactionType: "income",
                  }),
                });

                if (response.ok) {
                  toast.success("Transaction updated");
                  router.refresh();
                } else {
                  toast.error("Update failed");
                }
              } catch (error) {
                console.error("Failed to update transaction:", error);
                toast.error("Failed to update transaction");
              }
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<RokdaRow>[] = [
  {
    accessorKey: "transactionDate",
    header: "Date",
    cell: ({row}) => <span className="whitespace-nowrap">{formatDate(row.original.transactionDate)}</span>,
  },
  {
    accessorKey: "transactionAmount",
    header: "Amount",
    cell: ({row}) => {
      const isIncome = row.original.transactionType === "income";
      return (
        <span
          className={cn(
            "font-semibold whitespace-nowrap",
            isIncome ? "text-emerald-600" : "text-rose-600",
          )}
        >
          {isIncome ? "+" : "−"}
          {formatInr(row.original.transactionAmount)}
        </span>
      );
    },
  },
  {
    accessorKey: "transactionType",
    header: ({column}) => (
      <Button variant="ghost" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Type
      </Button>
    ),
    cell: ({row}) => (
      <span className="bg-zinc-100 rounded-full px-2.5 py-1 text-xs font-medium capitalize">
        {row.original.transactionType}
      </span>
    ),
  },
  {
    accessorKey: "isBorrow",
    header: "Lent?",
    cell: ({row}) => (
      <span className={row.original.isBorrow ? "font-medium text-amber-700" : "text-muted-foreground"}>
        {row.original.isBorrow ? "Yes" : "No"}
      </span>
    ),
  },
  {
    accessorKey: "borrower.name",
    header: "Lent to",
    cell: ({row}) => row.original.borrower?.name || "—",
  },
  {
    accessorKey: "sender.name",
    header: "Sender",
    cell: ({row}) => row.original.sender?.name || "—",
  },
  {
    accessorKey: "receiver.name",
    header: "Receiver",
    cell: ({row}) => row.original.receiver?.name || "—",
  },
  {
    accessorKey: "transactionDescription",
    header: "Note",
    cell: ({row}) => (
      <span className="block max-w-[280px] truncate" title={row.original.transactionDescription || undefined}>
        {row.original.transactionDescription || "—"}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({row}) => <MarkRepaidButton row={row.original} />,
  },
];
