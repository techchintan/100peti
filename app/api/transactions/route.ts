import {NextRequest, NextResponse} from "next/server";
import {getIronSession} from "iron-session";
import {revalidatePath} from "next/cache";

import {buildReturnedIncomeDescription} from "@/lib/finance/portfolio";
import {client} from "@/sanity/lib/client";
import {sessionOptions, type SessionData} from "@/lib/session";

type MarkReturnedBody = {
  _id: string;
  action: "mark_returned";
};

function isMarkReturnedBody(body: unknown): body is MarkReturnedBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "action" in body &&
    body.action === "mark_returned" &&
    "_id" in body &&
    typeof body._id === "string"
  );
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  try {
    const body = await request.json();

    if (!isMarkReturnedBody(body)) {
      return NextResponse.json({error: "Invalid request"}, {status: 400});
    }

    const existing = await client.fetch<{
      _id: string;
      transactionType?: string;
      transactionAmount?: number;
      isBorrow?: boolean;
      transactionDescription?: string;
      borrower?: {name?: string | null} | null;
    } | null>(
      `*[_id == $id][0]{
        _id,
        transactionType,
        transactionAmount,
        isBorrow,
        transactionDescription,
        "borrower": borrower->{name}
      }`,
      {id: body._id},
    );

    if (!existing) {
      return NextResponse.json({error: "Transaction not found"}, {status: 404});
    }

    if (existing.transactionType !== "expense" || !existing.isBorrow) {
      return NextResponse.json({error: "Only active lent-money entries can be marked returned"}, {status: 400});
    }

    if (!existing.transactionAmount || existing.transactionAmount <= 0) {
      return NextResponse.json({error: "Invalid transaction amount"}, {status: 400});
    }

    const borrowerName = existing.borrower?.name?.trim() || "Unknown";
    const returnedDate = new Date().toISOString().slice(0, 10);

    const income = await client.create({
      _type: "transactions",
      transactionType: "income",
      transactionAmount: existing.transactionAmount,
      transactionDate: returnedDate,
      transactionDescription: buildReturnedIncomeDescription(borrowerName, existing.transactionDescription),
      isBorrow: false,
    });

    const lent = await client
      .patch(body._id)
      .set({isBorrow: false})
      .unset(["borrower"])
      .commit();

    revalidatePath("/");
    revalidatePath("/cash/rokda");

    return NextResponse.json({income, lent});
  } catch (error) {
    console.error("Failed to record returned cash:", error);
    return NextResponse.json({error: "Failed to record returned cash"}, {status: 500});
  }
}
