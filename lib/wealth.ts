export const wealthSections = [
  {
    label: "Overview",
    href: "/",
    description: "Net worth & cash flow dashboard",
  },
  {
    label: "Rokda",
    href: "/cash/rokda",
    description: "Income, expense & lent money",
  },
  {
    label: "New Notes",
    href: "/cash/new-notes",
    description: "New notes inventory",
  },
  {
    label: "Trading",
    href: "/trading-investment",
    description: "Stocks, funds & investments",
  },
  {
    label: "Gold",
    href: "/gold-wealth",
    description: "Gold holdings & value",
  },
] as const;

export type PortfolioSummary = {
  cash: number;
  notesValue: number;
  notesCount: number;
  tradingValue: number;
  tradingInvested: number;
  tradingCount: number;
  goldValue: number;
  goldPurchase: number;
  goldCount: number;
  goldWeight: number;
};

export function getNetWorth(summary: PortfolioSummary) {
  return summary.cash + summary.notesValue + summary.tradingValue + summary.goldValue;
}

export function getTradingGain(summary: PortfolioSummary) {
  return summary.tradingValue - summary.tradingInvested;
}

export function getGoldGain(summary: PortfolioSummary) {
  return summary.goldValue - summary.goldPurchase;
}
