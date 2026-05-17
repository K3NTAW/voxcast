import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Twitch from "next-auth/providers/twitch";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      locale: string;
      theme: string;
    } & DefaultSession["user"];
  }
}

const providers: any[] = [];

if (process.env.AUTH_TWITCH_ID && process.env.AUTH_TWITCH_SECRET) {
  providers.push(
    Twitch({
      clientId: process.env.AUTH_TWITCH_ID,
      clientSecret: process.env.AUTH_TWITCH_SECRET,
    }),
  );
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}
if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  );
}

// Dev-only "Sign in as Dev User" — never wire this up in prod.
if (process.env.DEV_AUTH_ENABLED === "true" && process.env.NODE_ENV !== "production") {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev User",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Display name", type: "text" },
      },
      authorize: async (raw) => {
        const email = String(raw?.email ?? "dev@voxcast.local").trim().toLowerCase();
        const name = String(raw?.name ?? "Dev User").trim();
        if (!email) return null;
        const user = await prisma.user.upsert({
          where: { email },
          create: { email, name, image: null, locale: "en", theme: "dark" },
          update: { name },
        });
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // For Credentials provider to work alongside Prisma adapter, use JWT.
    // For OAuth-only deployments, this can be switched to "database".
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.uid && session.user) {
        session.user.id = String(token.uid);
        const u = await prisma.user.findUnique({
          where: { id: String(token.uid) },
          select: { locale: true, theme: true },
        });
        session.user.locale = u?.locale ?? "en";
        session.user.theme = u?.theme ?? "dark";
      }
      return session;
    },
  },
  providers,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});

export function availableProviders() {
  return providers.map((p: any) => ({
    id: p.id ?? p.options?.id ?? p.options?.name?.toLowerCase(),
    name: p.name ?? p.options?.name,
  }));
}
