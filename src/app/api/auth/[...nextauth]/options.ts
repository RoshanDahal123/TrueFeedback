import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

interface Credentials {
  identifier: string;
  password: string;
}

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Username", type: "text" }, // ✅ Fixed: was 'email'
        password: { label: "Password", type: "password" },
      },
      // @ts-expect-error NextAuth credential types don't match our interface
      async authorize(credentials: Credentials | undefined) {
        await dbConnect();
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error("Missing credentials");
          }
          
          const user = await UserModel.findOne({
            $or: [
              {
                email: credentials.identifier,
              },
              {
                username: credentials.identifier,
              },
            ],
          });
          
          if (!user) {
            throw new Error("No user found with this email");
          }
          
          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }
          
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (error: unknown) {
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user?.isVerified;
        token.isAcceptingMessage = user?.isAcceptingMessage; // ✅ Fixed: consistent field name
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage; // ✅ Fixed: consistent field name
        session.user.username = token.username;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const actualBaseUrl = getBaseUrl();
      
      console.log("Redirect callback:", { url, baseUrl, actualBaseUrl }); // Debug log
      
      // If url is relative, prepend with base URL
      if (url.startsWith("/")) return `${actualBaseUrl}${url}`;
      
      // If url is absolute and matches base URL, allow it
      if (url.startsWith(actualBaseUrl)) return url;
      
      // Default redirect to dashboard after successful login
      return `${actualBaseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // ✅ Added: redirect errors back to sign-in
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // ✅ Added: 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // ✅ Added: debug in development
};
