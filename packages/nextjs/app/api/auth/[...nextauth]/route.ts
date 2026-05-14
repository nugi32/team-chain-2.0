import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const whitelist: string[] = process.env.WHITELIST
  ? process.env.WHITELIST.split(",").map((email) =>
      email.trim().toLowerCase()
    )
  : [];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60,
  },

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

callbacks: {
  async signIn({ user }) {
    if (!user.email) return false;

    return whitelist.includes(user.email.toLowerCase());
  },

  async jwt({ token, profile }) {
    if (profile) {
      const githubProfile = profile as any;

      token.username = githubProfile.login;
      token.email = githubProfile.email;
      token.name = githubProfile.name;
      token.avatar = githubProfile.avatar_url;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.username = token.username as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.image = token.avatar as string;
    }

    return session;
  },
},
  pages: {
    signIn: "/createAccount",
    error: "/unauthorized",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };