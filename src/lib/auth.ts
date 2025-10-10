import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "./mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from "./tokens";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" }
      },

      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password, rememberMe } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email: email.toLowerCase() }) as any;

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          const tokenPayload: TokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username
          };

          // Generate tokens
          const accessToken = generateAccessToken(tokenPayload);
          const refreshToken = generateRefreshToken(tokenPayload);

          // Store refresh token in database if remember me is checked
          if (rememberMe === 'true') {
            await User.findByIdAndUpdate(user._id, { refreshToken });
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            accessToken,
            refreshToken: rememberMe === 'true' ? refreshToken : undefined
          };
        } catch (error) {
          console.log("Auth error: ", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days for remember me
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
      }

      // Return previous token if the access token has not expired yet
      if (token.exp && Date.now() < (token.exp as number) * 1000) {
        return token;
      }

      // Only try to refresh if we have a refresh token
      if (token.refreshToken) {
        return await refreshAccessToken(token);
      }

      // No refresh token and token is expired, return token with error
      return {
        ...token,
        error: "NoRefreshToken"
      };
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isVerified = token.isVerified as boolean;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
};

async function refreshAccessToken(token: any) {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token");
    }

    const decoded = verifyRefreshToken(token.refreshToken);
    
    await connectMongoDB();
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token.refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token in database
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}