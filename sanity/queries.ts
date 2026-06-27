import {groq} from "next-sanity";

import {GROQ_CASH_NOTE_QUANTITY} from "@/lib/finance/cash-notes";
import {GROQ_ACTIVE_LENT, GROQ_REGULAR_EXPENSE} from "@/lib/finance/portfolio";

export const HOME = groq`*[_type == "home"][0]`;

export const SETTINGS = groq`*[_type == "settings"][0]`;

export const DASHBOARD_TOTALS = groq`{
  "income": math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount),
  "expense": math::sum(*[${GROQ_REGULAR_EXPENSE}].transactionAmount),
  "lentMoney": math::sum(*[${GROQ_ACTIVE_LENT}].transactionAmount),
  "cash": (
    math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount)
    - math::sum(*[${GROQ_REGULAR_EXPENSE}].transactionAmount)
    - math::sum(*[${GROQ_ACTIVE_LENT}].transactionAmount)
  )
}`;

export const PORTFOLIO_SUMMARY = groq`{
  "cash": (
    math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount)
    - math::sum(*[${GROQ_REGULAR_EXPENSE}].transactionAmount)
    - math::sum(*[${GROQ_ACTIVE_LENT}].transactionAmount)
  ),
  "notesValue": math::sum(*[_type == "cashNotes"]{"v": denomination * ${GROQ_CASH_NOTE_QUANTITY}}.v),
  "notesCount": count(*[_type == "cashNotes"]),
  "notesBundles100": math::sum(*[_type == "cashNotes"]{"n": coalesce(bundles100, bundles, 0)}.n),
  "notesBundles50": math::sum(*[_type == "cashNotes"]{"n": coalesce(bundles50, 0)}.n),
  "tradingValue": math::sum(*[_type == "tradingInvestment" && status == "active"].currentValue),
  "tradingInvested": math::sum(*[_type == "tradingInvestment" && status == "active"].investedAmount),
  "tradingCount": count(*[_type == "tradingInvestment" && status == "active"]),
  "goldValue": math::sum(*[_type == "goldWealth"].currentValue),
  "goldPurchase": math::sum(*[_type == "goldWealth"].purchasePrice),
  "goldCount": count(*[_type == "goldWealth"]),
  "goldWeight": math::sum(*[_type == "goldWealth"].weightGrams)
}`;

export const ROKDA_TRANSACTIONS = groq`*[_type == "transactions" && ($type == "all" || transactionType == $type)] | order(transactionDate desc) {
    ...,
    _id,
    borrower->{
        _id,
        name,
    },
    sender->{
        _id,
        name,
    },
    receiver->{
        _id,
        name,
    },
}`;

export const CASH_NOTES = groq`*[_type == "cashNotes"] | order(denomination desc) {
  _id,
  denomination,
  bundles100,
  bundles50,
  looseNotes,
  lastCounted,
  notes,
  "bundles100Count": coalesce(bundles100, bundles, 0),
  "quantity": ${GROQ_CASH_NOTE_QUANTITY},
  "totalValue": denomination * ${GROQ_CASH_NOTE_QUANTITY}
}`;

export const TRADING_INVESTMENTS = groq`*[_type == "tradingInvestment"] | order(currentValue desc) {
  _id,
  name,
  platform,
  assetType,
  status,
  purchaseDate,
  investedAmount,
  currentValue,
  notes,
  "gainLoss": currentValue - investedAmount
}`;

export const GOLD_WEALTH = groq`*[_type == "goldWealth"] | order(currentValue desc) {
  _id,
  itemName,
  weightGrams,
  purity,
  location,
  purchaseDate,
  purchasePrice,
  currentValue,
  notes,
  "gainLoss": currentValue - purchasePrice
}`;
