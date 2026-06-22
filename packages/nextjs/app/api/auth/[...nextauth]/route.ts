import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60,
    updateAge: 30,
  },

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],

  callbacks: {
    async jwt({ token, profile, account }) {
      // If this is a new sign-in (has profile), update the token
      if (profile && account) {
        const githubProfile = profile as any;

        token.username = githubProfile.login;
        token.email = githubProfile.email;
        token.name = githubProfile.name;
        token.avatar = githubProfile.avatar_url;
        // Add timestamp to help invalidate old sessions
        token.iat = Math.floor(Date.now() / 1000);
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
    signIn: "/getStarted",
    error: "/unauthorized",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };