"use client";

import type {LucideIcon, LucideProps} from "lucide-react";
import {
  MinusIcon,
  PlusIcon,
  Code2,
  ExternalLink,
  HandCoins,
  Home,
  Image,
  IndianRupee,
  LayoutDashboard,
  List,
  Receipt,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export function sanityIcon(Icon: LucideIcon, size = 18) {
  function SanityLucideIcon(props: LucideProps) {
    return <Icon size={size} strokeWidth={1.75} {...props} />;
  }

  SanityLucideIcon.displayName = `Sanity${Icon.displayName ?? Icon.name ?? "Icon"}`;
  return SanityLucideIcon;
}

export const StudioIcons = {
  overview: sanityIcon(LayoutDashboard),
  transactions: sanityIcon(Wallet),
  allTransactions: sanityIcon(List),
  income: sanityIcon(TrendingUp),
  expense: sanityIcon(TrendingDown),
  lent: sanityIcon(HandCoins),
  people: sanityIcon(Users),
  home: sanityIcon(Home),
  settings: sanityIcon(Settings),
  receipt: sanityIcon(Receipt),
  rupee: sanityIcon(IndianRupee),
  openDashboard: sanityIcon(ExternalLink),
  image: sanityIcon(Image),
  code: sanityIcon(Code2),
  incomePreview: sanityIcon(PlusIcon, 16),
  expensePreview: sanityIcon(MinusIcon, 16),
  lentPreview: sanityIcon(HandCoins, 16),
};
