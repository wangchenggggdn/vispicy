import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { createUser, getUserById, getUserByEmail, updateUser, getTotalCoins } from './supabase';

// 扩展 NextAuth 类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      coins: number;
      rights_type?: string | null; // lite, pro, max
      subscription_type?: string | null; // week, year
      subscription_expires_at?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    rights_type?: string | null;
    subscription_type?: string | null;
    subscription_expires_at?: string | null;
    coins?: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        console.log('[Auth] SignIn callback for email:', user.email);

        // Check if user exists in our database
        const existingUser = await getUserByEmail(user.email);

        if (existingUser) {
          console.log('[Auth] User exists, updating profile:', existingUser.id);

          // Update user profile if changed
          await updateUser(existingUser.id, {
            name: user.name || existingUser.name,
            image: user.image || existingUser.image,
          });
        } else {
          console.log('[Auth] Creating new user with welcome coins');

          // Create new user with 100 free coins in the 'coins' field
          await createUser({
            id: user.id || user.email,
            email: user.email,
            name: user.name,
            image: user.image,
            coins: 100, // 注册赠送100金币到coins字段
          });
        }

        return true;
      } catch (error) {
        console.error('[Auth] Error signing in:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('[Auth] Session callback for user:', token.sub);
        console.log('[Auth] Token data:', JSON.stringify({
          rights_type: token.rights_type,
          subscription_type: token.subscription_type,
          subscription_expires_at: token.subscription_expires_at,
          coins: token.coins,
        }));

        // 使用 token 中的数据（JWT callback 已经从数据库刷新过了）
        const newSession = {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            rights_type: token.rights_type,
            subscription_type: token.subscription_type,
            subscription_expires_at: token.subscription_expires_at,
            coins: token.coins,
          },
        };
        console.log('[Auth] Returning new session.user:', JSON.stringify(newSession.user, null, 2));
        return newSession;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign in - set user ID in token
        token.sub = user.id;
        console.log('[Auth] JWT callback, initial sign in, set token.sub:', user.id);
      }

      // Always refresh all data from database (both on sign in and token refresh)
      if (token.sub) {
        try {
          const dbUser = await getUserById(token.sub);
          if (dbUser) {
            // 计算总金币
            const totalCoins = ((dbUser as any).sub_coins || 0) +
                              ((dbUser as any).coins || 0) +
                              ((dbUser as any).inapp_coins || 0);

            console.log('[Auth] JWT callback, user from DB:', JSON.stringify({
              id: (dbUser as any).id,
              rights_type: (dbUser as any).rights_type,
              subscription_type: (dbUser as any).subscription_type,
              subscription_expires_at: (dbUser as any).subscription_expires_at,
              totalCoins,
            }));

            // 更新 token 中的所有数据
            token.rights_type = (dbUser as any).rights_type;
            token.subscription_type = (dbUser as any).subscription_type;
            token.subscription_expires_at = (dbUser as any).subscription_expires_at;
            token.coins = totalCoins;

            console.log('[Auth] JWT callback, data stored in token:', {
              rights_type: token.rights_type,
              subscription_type: token.subscription_type,
              subscription_expires_at: token.subscription_expires_at,
              coins: token.coins,
            });
          }
        } catch (error) {
          console.error('[Auth] JWT callback, error loading user:', error);
        }
      }

      return token;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 1 * 60, // Update session every 1 minute to reflect coin changes
  },
  secret: process.env.NEXTAUTH_SECRET,
};
