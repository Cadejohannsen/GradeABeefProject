import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuth } from "@/lib/firebase-admin";
import { findUnique, findUniqueByEmail, type Coach } from "@/lib/json-db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;

        try {
          const decoded = await adminAuth.verifyIdToken(credentials.idToken);

          // Look up coach by Firebase UID first, then fall back to email
          let coach: Coach | null = findUnique<Coach>("coaches", decoded.uid);
          if (!coach && decoded.email) {
            coach = findUniqueByEmail<Coach>("coaches", decoded.email);
          }

          if (!coach) return null;

          return {
            id: coach.id,
            email: coach.email,
            name: coach.name,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
