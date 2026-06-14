import type {DocumentBadgeComponent} from "sanity";

export const TransactionTypeBadge: DocumentBadgeComponent = (props) => {
  const doc = props.draft ?? props.published;
  const isBorrow = doc?.isBorrow === true;
  const type = doc?.transactionType;

  if (isBorrow) {
    return {
      label: "Lent",
      title: "Lent money",
      color: "warning",
    };
  }

  if (type === "income") {
    return {
      label: "Income",
      title: "Income",
      color: "success",
    };
  }

  if (type === "expense") {
    return {
      label: "Expense",
      title: "Expense",
      color: "danger",
    };
  }

  return null;
};
