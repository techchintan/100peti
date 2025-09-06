import {SessionOptions} from "iron-session";

export interface SessionData {
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.COOKIE_SECRET as string,
  cookieName: "auth_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
