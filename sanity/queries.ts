import {groq} from "next-sanity";

export const HOME = groq`*[_type == "home"][0]`;

export const SETTINGS = groq`*[_type == "settings"][0]`;

export const ROKDA_TRANSACTIONS = groq`*[_type == "transactions" && ($type == "all" || transactionType == $type)] {
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
