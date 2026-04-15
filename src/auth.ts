import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function resolveApiBase() {
  return (
    process.env.NEXT_PUBLIC_CLIENT_PORTAL_API_BASE ||
    process.env.NEXT_PUBLIC_BOOKING_API_BASE ||
    "https://agenziaplinio.it"
  ).replace(/\/+$/, "");
}

function decodeTokenPayload(token: string) {
  const [payloadPart] = String(token).split(".");
  if (!payloadPart) return null;
  try {
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const raw = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(raw) as {
      username?: string;
      userId?: number | null;
      source?: string;
      exp?: number;
    };
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        const apiBase = resolveApiBase();
        try {
          const res = await fetch(`${apiBase}/api/client-auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            cache: "no-store",
          });

          if (!res.ok) return null;

          const data = (await res.json()) as { token?: string; message?: string };
          if (!data.token) return null;

          const payload = decodeTokenPayload(data.token);
          if (!payload?.username) return null;

          return {
            id: String(payload.userId ?? payload.username),
            name: String(payload.username),
            email: "",
            username: String(payload.username),
            userId: typeof payload.userId === "number" ? payload.userId : null,
            source: payload.source ?? "unknown",
            rawToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = (user as Record<string, unknown>).username as string;
        token.userId = (user as Record<string, unknown>).userId as number | null;
        token.source = (user as Record<string, unknown>).source as string;
        token.rawToken = (user as Record<string, unknown>).rawToken as string;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          username: token.username as string | undefined,
          userId: token.userId as number | null | undefined,
          source: token.source as string | undefined,
          rawToken: token.rawToken as string | undefined,
        },
      };
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 giorni
  },
});
