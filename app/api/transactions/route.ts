import {NextRequest, NextResponse} from "next/server";
import {client} from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const {_id, isBorrow, transactionType} = await request.json();

    const transaction = await client.patch(_id).set({isBorrow, transactionType}).commit();

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json({error: "Failed to update transaction"}, {status: 500});
  }
}
