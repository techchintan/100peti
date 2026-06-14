"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  HandCoins,
  IndianRupee,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {Box, Card, Flex, Grid, Heading, Spinner, Stack, Text} from "@sanity/ui";
import {useEffect, useState} from "react";
import {useClient} from "sanity";

import {apiVersion} from "../env";

const OVERVIEW_QUERY = `{
  "income": math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount),
  "expense": math::sum(*[_type == "transactions" && transactionType == "expense" && !isBorrow].transactionAmount),
  "lentMoney": math::sum(*[_type == "transactions" && transactionType == "expense" && isBorrow].transactionAmount),
  "cash": (
    math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount)
    - math::sum(*[_type == "transactions" && transactionType == "expense" && !isBorrow].transactionAmount)
    - math::sum(*[_type == "transactions" && transactionType == "expense" && isBorrow].transactionAmount)
  ),
  "transactionCount": count(*[_type == "transactions"]),
  "peopleCount": count(*[_type == "intermediaries"]),
  "recentTransactions": *[_type == "transactions"] | order(transactionDate desc) [0...6] {
    _id,
    transactionDate,
    transactionAmount,
    transactionType,
    isBorrow,
    transactionDescription,
    "borrower": borrower->name,
    "sender": sender->name,
    "receiver": receiver->name
  }
}`;

type RecentTransaction = {
  _id: string;
  transactionDate?: string;
  transactionAmount?: number;
  transactionType?: "income" | "expense";
  isBorrow?: boolean;
  transactionDescription?: string;
  borrower?: string;
  sender?: string;
  receiver?: string;
};

type OverviewTotals = {
  income: number;
  expense: number;
  lentMoney: number;
  cash: number;
  transactionCount: number;
  peopleCount: number;
  recentTransactions: RecentTransaction[];
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
    : "—";

type StatTone = "income" | "expense" | "lent" | "cash";

const toneStyles: Record<
  StatTone,
  {Icon: LucideIcon; iconBg: string; iconColor: string; label: string}
> = {
  income: {
    Icon: ArrowDownRight,
    iconBg: "#ecfdf5",
    iconColor: "#059669",
    label: "Total Income",
  },
  expense: {
    Icon: ArrowUpRight,
    iconBg: "#fff1f2",
    iconColor: "#e11d48",
    label: "Total Expenses",
  },
  lent: {
    Icon: HandCoins,
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    label: "Lent Money",
  },
  cash: {
    Icon: IndianRupee,
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    label: "Cash at Home",
  },
};

function StatIcon({tone}: {tone: StatTone}) {
  const {Icon, iconBg, iconColor} = toneStyles[tone];

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: iconBg,
        color: iconColor,
        flexShrink: 0,
      }}
    >
      <Icon size={20} strokeWidth={1.75} />
    </Flex>
  );
}

function MetricCard({
  tone,
  value,
  featured = false,
}: {
  tone: StatTone;
  value?: number;
  featured?: boolean;
}) {
  const {label} = toneStyles[tone];

  return (
    <Card padding={4} radius={3} border shadow={featured ? 1 : 0}>
      <Stack space={4}>
        <Flex align="center" justify="space-between">
          <StatIcon tone={tone} />
          {featured ? (
            <Box
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--card-muted-fg-color, #71717a)",
              }}
            >
              Live
            </Box>
          ) : null}
        </Flex>
        <Stack space={2}>
          <Text size={1} muted weight="medium">
            {label}
          </Text>
          <Text size={featured ? 4 : 2} weight="bold">
            {formatInr(value)}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

function FormulaStrip({totals}: {totals: OverviewTotals}) {
  const parts = [
    {label: "Income", value: totals.income},
    {label: "Expenses", value: totals.expense, operator: "−" as const},
    {label: "Lent", value: totals.lentMoney, operator: "−" as const},
    {label: "Cash", value: totals.cash, operator: "=" as const},
  ];

  return (
    <Card padding={4} radius={3} border tone="transparent">
      <Flex align="center" gap={4} wrap="wrap">
        {parts.map(({label, value, operator}, index) => (
          <Flex align="center" gap={4} key={label}>
            {operator && index > 0 ? (
              <Text muted size={2} weight="semibold">
                {operator}
              </Text>
            ) : null}
            <Stack space={2}>
              <Text size={0} muted style={{textTransform: "uppercase", letterSpacing: "0.05em"}}>
                {label}
              </Text>
              <Text size={1} weight="semibold">
                {formatInr(value)}
              </Text>
            </Stack>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

function MetaStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card padding={4} radius={3} border>
      <Flex align="flex-start" gap={3}>
        <Flex
          align="center"
          justify="center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--card-muted-bg-color, #f4f4f5)",
            color: "var(--card-fg-color, #52525b)",
            flexShrink: 0,
          }}
        >
          <Icon size={18} strokeWidth={1.75} />
        </Flex>
        <Stack space={2} flex={1}>
          <Text size={1} muted weight="medium">
            {label}
          </Text>
          <Text size={2} weight="semibold">
            {value}
          </Text>
          <Text size={1} muted>
            {hint}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

function getRecentLabel(tx: RecentTransaction) {
  if (tx.isBorrow) return tx.borrower ? `Lent to ${tx.borrower}` : "Lent money";
  if (tx.sender || tx.receiver) {
    return [tx.sender, tx.receiver].filter(Boolean).join(" → ");
  }
  return tx.transactionDescription?.trim() || "Transaction";
}

function RecentActivity({items}: {items: RecentTransaction[]}) {
  if (items.length === 0) {
    return (
      <Card padding={4} radius={3} border>
        <Text muted size={1}>
          No transactions yet.
        </Text>
      </Card>
    );
  }

  return (
    <Card padding={3} radius={3} border>
      <Stack space={3}>
        {items.map((tx) => {
          const isIncome = tx.transactionType === "income" && !tx.isBorrow;
          const isLent = Boolean(tx.isBorrow);
          const prefix = isIncome ? "+" : "−";
          const tone = isLent ? "lent" : isIncome ? "income" : "expense";
          const {Icon, iconBg, iconColor} = toneStyles[tone];

          return (
            <Flex align="flex-start" gap={3} key={tx._id}>
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 32,
                  height: 32,
                  marginTop: 2,
                  borderRadius: 8,
                  background: iconBg,
                  color: iconColor,
                  flexShrink: 0,
                }}
              >
                <Icon size={16} strokeWidth={1.75} />
              </Flex>
              <Box flex={1} style={{minWidth: 0}}>
                <Flex align="flex-start" gap={3} justify="space-between" marginBottom={2}>
                  <Text size={1} weight="semibold">
                    {prefix} {formatInr(tx.transactionAmount)}
                  </Text>
                  <Text muted size={0} style={{flexShrink: 0, lineHeight: 1.5}}>
                    {formatDate(tx.transactionDate)}
                  </Text>
                </Flex>
                <Text muted size={1} style={{lineHeight: 1.5}}>
                  {getRecentLabel(tx)}
                </Text>
              </Box>
            </Flex>
          );
        })}
      </Stack>
    </Card>
  );
}

export function FinanceOverview() {
  const client = useClient({apiVersion});
  const [totals, setTotals] = useState<OverviewTotals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    client
      .fetch<OverviewTotals>(OVERVIEW_QUERY)
      .then((data: OverviewTotals) => {
        if (active) setTotals(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [client]);

  if (loading) {
    return (
      <Flex align="center" justify="center" padding={6} style={{minHeight: 320}}>
        <Stack space={4} style={{alignItems: "center"}}>
          <Spinner muted />
          <Text muted size={1}>
            Loading finance totals…
          </Text>
        </Stack>
      </Flex>
    );
  }

  if (!totals) return null;

  return (
    <Box padding={4} sizing="border">
      <Stack space={5}>
        <Flex align="flex-start" gap={4} justify="space-between" wrap="wrap">
          <Stack space={3}>
            <Flex align="center" gap={3}>
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--card-muted-bg-color, #f4f4f5)",
                  color: "var(--card-fg-color, #3f3f46)",
                }}
              >
                <Wallet size={22} strokeWidth={1.75} />
              </Flex>
              <Stack space={2}>
                <Heading as="h1" size={3}>
                  Finance Overview
                </Heading>
                <Text muted size={1}>
                  Live totals synced with your home dashboard.
                </Text>
              </Stack>
            </Flex>
          </Stack>
        </Flex>

        <Grid columns={[1, 1, 2, 4]} gap={3}>
          <MetricCard tone="cash" value={totals.cash} featured />
          <MetricCard tone="income" value={totals.income} />
          <MetricCard tone="expense" value={totals.expense} />
          <MetricCard tone="lent" value={totals.lentMoney} />
        </Grid>

        <FormulaStrip totals={totals} />

        <Grid columns={[1, 2]} gap={3}>
          <MetaStat
            hint="All income, expense & lent records"
            icon={Receipt}
            label="Transactions"
            value={`${totals.transactionCount}`}
          />
          <MetaStat
            hint="People in your address book"
            icon={Users}
            label="Intermediaries"
            value={`${totals.peopleCount}`}
          />
        </Grid>

        <Stack space={3}>
          <Flex align="center" justify="space-between">
            <Text size={1} weight="semibold">
              Recent activity
            </Text>
            <Text muted size={0}>
              Last {totals.recentTransactions.length} transactions
            </Text>
          </Flex>
          <RecentActivity items={totals.recentTransactions} />
        </Stack>
      </Stack>
    </Box>
  );
}
