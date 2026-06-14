import {NextRequest, NextResponse} from "next/server";
import {getIronSession} from "iron-session";
import {revalidatePath} from "next/cache";

import {client} from "@/sanity/lib/client";
import {sessionOptions, type SessionData} from "@/lib/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  try {
    const {_id, isBorrow, transactionType} = await request.json();

    const transaction = await client.patch(_id).set({isBorrow, transactionType}).commit();

    revalidatePath("/");
    revalidatePath("/cash/rokda");

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json({error: "Failed to update transaction"}, {status: 500});
  }
}
