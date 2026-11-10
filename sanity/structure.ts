import type {StructureResolver} from "sanity/structure";

import {StudioIcons} from "./studio/icons";
import {FinanceOverview} from "./studio/FinanceOverview";

const DATE_DESC = [{field: "transactionDate", direction: "desc" as const}];

const transactionList = (S: Parameters<StructureResolver>[0], title: string, filter: string) =>
  S.documentList()
    .title(title)
    .schemaType("transactions")
    .filter(filter)
    .defaultOrdering(DATE_DESC);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sudani Finance")
    .items([
      S.listItem()
        .title("Overview")
        .icon(StudioIcons.overview)
        .child(S.component().component(FinanceOverview).title("Finance Overview")),
      S.divider(),
      S.listItem()
        .title("Transactions")
        .icon(StudioIcons.transactions)
        .child(
          S.list()
            .title("Transactions")
            .items([
              S.listItem()
                .title("All Transactions")
                .icon(StudioIcons.allTransactions)
                .child(transactionList(S, "All Transactions", '_type == "transactions"')),
              S.divider(),
              S.listItem()
                .title("Income")
                .icon(StudioIcons.income)
                .child(
                  transactionList(
                    S,
                    "Income",
                    '_type == "transactions" && transactionType == "income" && !coalesce(isBorrow, false)',
                  ),
                ),
              S.listItem()
                .title("Expenses")
                .icon(StudioIcons.expense)
                .child(
                  transactionList(
                    S,
                    "Expenses",
                    '_type == "transactions" && transactionType == "expense" && !coalesce(isBorrow, false)',
                  ),
                ),
              S.listItem()
                .title("Lent Money")
                .icon(StudioIcons.lent)
                .child(
                  transactionList(
                    S,
                    "Lent Money",
                    '_type == "transactions" && transactionType == "expense" && isBorrow == true',
                  ),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Wealth")
        .icon(StudioIcons.gold)
        .child(
          S.list()
            .title("Wealth")
            .items([
              S.listItem()
                .title("New Notes")
                .icon(StudioIcons.cashNotes)
                .child(
                  S.documentTypeList("cashNotes")
                    .title("New Notes")
                    .defaultOrdering([{field: "denomination", direction: "desc"}]),
                ),
              S.listItem()
                .title("Trading & Investment")
                .icon(StudioIcons.trading)
                .child(
                  S.documentTypeList("tradingInvestment")
                    .title("Trading & Investment")
                    .defaultOrdering([{field: "currentValue", direction: "desc"}]),
                ),
              S.listItem()
                .title("Gold Wealth")
                .icon(StudioIcons.gold)
                .child(
                  S.documentTypeList("goldWealth")
                    .title("Gold Wealth")
                    .defaultOrdering([{field: "currentValue", direction: "desc"}]),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("People")
        .icon(StudioIcons.people)
        .child(
          S.documentTypeList("intermediaries")
            .title("Intermediaries")
            .defaultOrdering([{field: "name", direction: "asc"}]),
        ),
      S.divider(),
      S.listItem()
        .title("Website")
        .icon(StudioIcons.home)
        .child(
          S.list()
            .title("Website")
            .items([
              S.listItem()
                .title("Home Page")
                .icon(StudioIcons.home)
                .child(S.editor().schemaType("home").documentId("home").title("Home Page")),
              S.listItem()
                .title("Site Settings")
                .icon(StudioIcons.settings)
                .child(
                  S.editor().schemaType("settings").documentId("settings").title("Site Settings"),
                ),
            ]),
        ),
      S.divider(),
    ]);
