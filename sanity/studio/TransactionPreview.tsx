"use client";

import {HandCoins, MinusIcon, PlusIcon} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {Box, Flex, Text} from "@sanity/ui";
import type {PreviewProps} from "sanity";

type TransactionKind = "income" | "expense" | "lent";

type TransactionPreviewProps = PreviewProps & {
  transactionDate?: string;
  transactionAmount?: number;
  transactionType?: "income" | "expense";
  isBorrow?: boolean;
  sender?: string;
  receiver?: string;
  borrower?: string;
  transactionDescription?: string;
};

const formatInr = (amount?: number) =>
  (amount ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No date";

const getKind = (transactionType?: string, isBorrow?: boolean): TransactionKind => {
  if (isBorrow) return "lent";
  if (transactionType === "income") return "income";
  return "expense";
};

const kindMeta: Record<TransactionKind, {label: string; Icon: LucideIcon}> = {
  income: {label: "Income", Icon: PlusIcon},
  expense: {label: "Expense", Icon: MinusIcon},
  lent: {label: "Lent", Icon: HandCoins},
};

function TransactionPreviewIcon({kind}: {kind: TransactionKind}) {
  const {Icon} = kindMeta[kind];

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--card-muted-bg-color, #f4f4f5)",
        color: "var(--card-fg-color, #52525b)",
      }}
    >
      <Icon size={16} strokeWidth={1.75} />
    </Flex>
  );
}

function TypePill({kind}: {kind: TransactionKind}) {
  const {label} = kindMeta[kind];

  return (
    <Box
      style={{
        borderRadius: 999,
        background: "var(--card-muted-bg-color, #f4f4f5)",
        color: "var(--card-muted-fg-color, #71717a)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.03em",
        lineHeight: 1,
        padding: "3px 8px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Box>
  );
}

export function TransactionPreview(props: TransactionPreviewProps) {
  const {
    renderDefault,
    transactionAmount,
    transactionDate,
    transactionType,
    isBorrow,
    sender,
    receiver,
    borrower,
    transactionDescription,
  } = props;

  const kind = getKind(transactionType, isBorrow);
  const prefix = kind === "income" ? "+" : "-";

  const parties =
    kind === "lent"
      ? (borrower ?? "Unknown")
      : [sender, receiver].filter(Boolean).join(" → ") || "No parties";

  const description = transactionDescription?.trim();
  const subtitle = `${formatDate(transactionDate)} · ${parties}`;

  return renderDefault({
    ...props,
    media: <TransactionPreviewIcon kind={kind} />,
    title: (
      <Flex align="center" gap={2} wrap="wrap">
        <Text size={1} weight="semibold">
          {prefix} {formatInr(transactionAmount)}
        </Text>
        <TypePill kind={kind} />
      </Flex>
    ),
    subtitle,
    description: description
      ? description.length > 72
        ? `${description.slice(0, 72)}…`
        : description
      : undefined,
  });
}
