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
