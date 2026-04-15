import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
    userId?: number | null;
    source?: string;
    rawToken?: string;
  }

  interface Session {
    user: {
      username?: string;
      userId?: number | null;
      source?: string;
      rawToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username?: string;
    userId?: number | null;
    source?: string;
    rawToken?: string;
  }
}
