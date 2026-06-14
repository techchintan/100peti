"use client";

import {visionTool} from "@sanity/vision";
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {codeInput} from "@sanity/code-input";

import {apiVersion, dataset, projectId} from "./sanity/env";
import {schema} from "./sanity/schema";
import {structure} from "./sanity/structure";
import {StudioLogo} from "./sanity/studio/StudioLogo";
import {StudioNavbar} from "./sanity/studio/StudioNavbar";
import {TransactionTypeBadge} from "./sanity/studio/TransactionBadges";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const singletonTypes = new Set(["home", "settings"]);

export default defineConfig({
  title: "Sudani Finance",
  name: "finance-tracker",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: apiVersion}), codeInput()],
  studio: {
    components: {
      logo: StudioLogo,
      navbar: StudioNavbar,
    },
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({action}) => action && singletonActions.has(action))
        : input,
    badges: (prev, {schemaType}) =>
      schemaType === "transactions" ? [...prev, TransactionTypeBadge] : prev,
  },
  schema: {
    types: schema.types,
    templates: (templates) => [
      ...templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
      {
        id: "income-transaction",
        title: "Income",
        schemaType: "transactions",
        value: {transactionType: "income", isBorrow: false},
      },
      {
        id: "expense-transaction",
        title: "Expense",
        schemaType: "transactions",
        value: {transactionType: "expense", isBorrow: false},
      },
      {
        id: "lent-money-transaction",
        title: "Lent Money",
        schemaType: "transactions",
        value: {transactionType: "expense", isBorrow: true},
      },
    ],
  },
});
