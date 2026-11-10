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
import {isActiveLent} from "@/lib/finance/portfolio";
import {cn} from "@/lib/utils";
import type {ROKDA_TRANSACTIONSResult} from "@/sanity.types";

type RokdaRow = ROKDA_TRANSACTIONSResult[number];

function MarkReturnedButton({row}: {row: RokdaRow}) {
  const router = useRouter();

  if (!isActiveLent(row)) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const borrowerName = row.borrower?.name || "someone";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CheckIcon className="size-4 text-emerald-600" />
          Record return
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Record cash returned?</AlertDialogTitle>
          <AlertDialogDescription>
            Keeps the original lent expense on file, adds a new income entry for{" "}
            {formatInr(row.transactionAmount)} from {borrowerName}, and clears active lent status.
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
                    action: "mark_returned",
                  }),
                });

                if (response.ok) {
                  toast.success("Return recorded");
                  router.refresh();
                  return;
                }

                const payload = (await response.json().catch(() => null)) as {
                  error?: string;
                } | null;
                toast.error(payload?.error ?? "Update failed");
              } catch (error) {
                console.error("Failed to record returned cash:", error);
                toast.error("Failed to record returned cash");
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
    cell: ({row}) => (
      <span className="whitespace-nowrap">{formatDate(row.original.transactionDate)}</span>
    ),
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
      <Button
        variant="ghost"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
      </Button>
    ),
    cell: ({row}) => (
      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize">
        {row.original.transactionType}
      </span>
    ),
  },
  {
    accessorKey: "isBorrow",
    header: "Lent?",
    cell: ({row}) => (
      <span
        className={row.original.isBorrow ? "font-medium text-amber-700" : "text-muted-foreground"}
      >
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
      <span
        className="block max-w-[280px] truncate"
        title={row.original.transactionDescription || undefined}
      >
        {row.original.transactionDescription || "—"}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({row}) => <MarkReturnedButton row={row.original} />,
  },
];
