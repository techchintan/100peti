import {cookies} from "next/headers";
import {getIronSession} from "iron-session";
import {sessionOptions, type SessionData} from "@/lib/session";

export async function POST(req: Request) {
  const {email, password} = await req.json();
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (
    email.trim() === process.env.STATIC_EMAIL &&
    password.trim() === process.env.STATIC_PASSWORD
  ) {
    session.isLoggedIn = true;
    await session.save();
    return new Response("OK");
  }

  return new Response("Unauthorized", {status: 401});
}
