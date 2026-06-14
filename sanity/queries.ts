import {groq} from "next-sanity";

export const HOME = groq`*[_type == "home"][0]`;

export const SETTINGS = groq`*[_type == "settings"][0]`;

export const DASHBOARD_TOTALS = groq`{
  "income": math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount),
  "expense": math::sum(*[_type == "transactions" && transactionType == "expense" && !isBorrow].transactionAmount),
  "lentMoney": math::sum(*[_type == "transactions" && transactionType == "expense" && isBorrow].transactionAmount),
  "cash": (
    math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount)
    - math::sum(*[_type == "transactions" && transactionType == "expense" && !isBorrow].transactionAmount)
    - math::sum(*[_type == "transactions" && transactionType == "expense" && isBorrow].transactionAmount)
  )
}`;

export const PORTFOLIO_SUMMARY = groq`{
  "cash": (
    math::sum(*[_type == "transactions" && transactionType == "income"].transactionAmount)
    - math::sum(*[_type == "transactions" && transactionType == "expense" && !isBorrow].transactionAmount)
    - math::sum(*[_type == "transactions" && transactionType == "expense" && isBorrow].transactionAmount)
  ),
  "notesValue": math::sum(*[_type == "cashNotes"].denomination * (
    select(
      defined(bundles100) || defined(bundles50) || defined(bundles) || defined(looseNotes) =>
        coalesce(bundles100, bundles, 0) * 100 + coalesce(bundles50, 0) * 50 + coalesce(looseNotes, 0),
      coalesce(quantity, 0)
    )
  )),
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
  "quantity": select(
    defined(bundles100) || defined(bundles50) || defined(bundles) || defined(looseNotes) =>
      coalesce(bundles100, bundles, 0) * 100 + coalesce(bundles50, 0) * 50 + coalesce(looseNotes, 0),
    coalesce(quantity, 0)
  ),
  "totalValue": denomination * select(
    defined(bundles100) || defined(bundles50) || defined(bundles) || defined(looseNotes) =>
      coalesce(bundles100, bundles, 0) * 100 + coalesce(bundles50, 0) * 50 + coalesce(looseNotes, 0),
    coalesce(quantity, 0)
  )
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
