import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createUser, getUserById, getUserByEmail, updateUser, getTotalCoins, getUserByAppleId, getUserByGoogleId } from './supabase';

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
    // 开发环境的 Mock 登录
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: 'mock-login',
        name: 'Mock Login',
        credentials: {
          email: { label: 'Email', type: 'email' },
          name: { label: 'Name', type: 'text' },
          image: { label: 'Image', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.email) {
            return null;
          }

          console.log('[Auth] Mock authorize called with:', credentials);

          // 查找或创建用户
          const existingUser = await getUserByEmail(credentials.email as string);

          let user;
          if (existingUser) {
            console.log('[Auth] Mock authorize: user exists');
            user = existingUser;
          } else {
            console.log('[Auth] Mock authorize: creating new user');
            user = await createUser({
              email: credentials.email as string,
              name: credentials.name as string,
              image: credentials.image as string,
              coins: 50,
            });
          }

          // 返回用户数据，NextAuth 会自动处理 JWT 创建和 session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
    ] : []),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
      // 明确请求邮箱和姓名权限
      scope: 'name email',
      // 禁用 PKCE（Apple 不需要，会导致 cookie 丢失）
      checks: ['none'], // 禁用所有检查，包括 PKCE
      authorization: {
        params: {
          response_mode: 'form_post',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  debug: true, // 启用 NextAuth 调试模式
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[Auth] ===== SignIn Callback START =====');
      console.log('[Auth] Provider:', account?.provider);
      console.log('[Auth] User object:', JSON.stringify(user, null, 2));
      console.log('[Auth] Account object:', JSON.stringify(account, null, 2));
      console.log('[Auth] Profile object:', JSON.stringify(profile, null, 2));

      // Helper function to extract username from email
      const getUsernameFromEmail = (email: string) => {
        if (!email) return 'User';
        const username = email.split('@')[0];
        // Capitalize first letter
        return username.charAt(0).toUpperCase() + username.slice(1);
      };

      // Helper function to generate avatar from Dicebear
      const generateAvatar = (email: string) => {
        const seed = email.split('@')[0];
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
      };

      // 检查是否有错误
      if (account?.provider === 'apple' && !profile) {
        console.error('[Auth] ❌ Apple callback failed: No profile received');
        console.error('[Auth] This usually means Apple rejected the client_secret');
        console.error('[Auth] APPLE_SECRET length:', process.env.APPLE_SECRET?.length);
        console.error('[Auth] APPLE_ID:', process.env.APPLE_ID);
        console.error('[Auth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
        return false;
      }

      // Apple Sign In 特殊处理
      if (account?.provider === 'apple') {
        console.log('[Auth] Apple Sign In detected');

        // Apple 返回的 email 可能为空（用户选择隐藏）
        // profile.sub 是 Apple 的唯一用户 ID
        const appleId = profile?.sub;
        const appleEmail = profile?.email || user?.email;

        console.log('[Auth] Apple ID:', appleId);
        console.log('[Auth] Apple Email:', appleEmail);

        if (!appleEmail) {
          console.error('[Auth] Apple Sign In: No email provided by user');
          return false;
        }

        // 使用 Apple ID 查找用户（Apple ID 是唯一的）
        let existingUser = null;

        if (appleId) {
          // 优先用 Apple ID 查找
          console.log('[Auth] Looking for user by Apple ID:', appleId);
          existingUser = await getUserByAppleId(appleId);
          if (existingUser) {
            console.log('[Auth] Found user by Apple ID:', existingUser.id);
          }
        }

        // 如果 Apple ID 没找到，再用 email 查找（处理用户换邮箱的情况）
        if (!existingUser && appleEmail) {
          console.log('[Auth] User not found by Apple ID, trying to find by email');
          existingUser = await getUserByEmail(appleEmail);
          if (existingUser) {
            console.log('[Auth] Found user by email:', existingUser.id);
            // 如果是通过 email 找到的用户，需要更新 apple_id（因为之前可能没有保存）
            await updateUser(existingUser.id, { apple_id: appleId });
          }
        }

        if (existingUser) {
          console.log('[Auth] Apple user exists:', existingUser.id);
          await updateUser(existingUser.id, {
            name: user.name || existingUser.name,
            image: user.image || existingUser.image,
          });
          // 使用数据库中的 UUID 作为 user.id
          user.id = existingUser.id;
        } else {
          console.log('[Auth] Creating new Apple user');

          // 创建用户（数据库会自动生成 UUID）
          const newUser = await createUser({
            email: appleEmail,
            name: user.name || getUsernameFromEmail(appleEmail),
            image: user.image || generateAvatar(appleEmail),
            coins: 100,
            apple_id: appleId, // 保存 Apple ID
          });

          // 使用数据库返回的 UUID 作为 user.id
          user.id = newUser.id;
          console.log('[Auth] Created new user with ID:', newUser.id);
        }

        return true;
      }

      // Google 和其他 OAuth 提供商
      if (!user.email) {
        console.error('[Auth] Sign in rejected: No email provided');
        return false;
      }

      try {
        console.log('[Auth] OAuth SignIn for email:', user.email);

        // 获取 Google 的 sub（Google ID）
        const googleId = account?.providerAccountId;

        // Check if user exists in our database
        let existingUser = await getUserByEmail(user.email);

        // 如果没找到，尝试用 Google ID 查找
        if (!existingUser && googleId) {
          console.log('[Auth] User not found by email, trying to find by Google ID');
          existingUser = await getUserByGoogleId(googleId);
          if (existingUser) {
            console.log('[Auth] Found user by Google ID:', existingUser.id);
          }
        }

        if (existingUser) {
          console.log('[Auth] User exists, updating profile:', existingUser.id);

          // Update user profile if changed
          await updateUser(existingUser.id, {
            name: user.name || existingUser.name,
            image: user.image || existingUser.image,
            ...(googleId && { google_id: googleId }), // 保存 Google ID
          });

          // 使用数据库中的 UUID 作为 user.id
          user.id = existingUser.id;
        } else {
          console.log('[Auth] Creating new user with welcome coins');

          // Create new user with 100 free coins in the 'coins' field
          const newUser = await createUser({
            email: user.email,
            name: user.name || getUsernameFromEmail(user.email),
            image: user.image || generateAvatar(user.email),
            coins: 100, // 注册赠送100金币到coins字段
            ...(googleId && { google_id: googleId }), // 保存 Google ID
          });

          // 使用数据库返回的 UUID 作为 user.id
          user.id = newUser.id;
          console.log('[Auth] Created new user with ID:', newUser.id);
        }

        return true;
      } catch (error) {
        console.error('[Auth] Error signing in:', error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log('[Auth] Session callback called');
      console.log('[Auth] Input session:', JSON.stringify(session, null, 2));
      console.log('[Auth] Input token:', JSON.stringify({
        sub: token.sub,
        email: token.email,
        name: token.name,
        picture: token.picture,
        coins: token.coins,
        rights_type: token.rights_type,
        subscription_type: token.subscription_type,
      }, null, 2));

      if (session.user && token.sub) {
        // 如果 token 中有完整数据，直接使用
        const newSession = {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            email: token.email || session.user.email,
            name: token.name || session.user.name,
            image: token.picture || session.user.image,
            coins: token.coins || 0,
            rights_type: token.rights_type || null,
            subscription_type: token.subscription_type || null,
            subscription_expires_at: token.subscription_expires_at || null,
          },
        };

        console.log('[Auth] Returning session:', JSON.stringify(newSession.user, null, 2));
        return newSession;
      }

      console.log('[Auth] No valid session/user, returning original session');
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
              name: (dbUser as any).name,
              email: (dbUser as any).email,
              rights_type: (dbUser as any).rights_type,
              subscription_type: (dbUser as any).subscription_type,
              subscription_expires_at: (dbUser as any).subscription_expires_at,
              totalCoins,
            }));

            // 更新 token 中的所有数据
            token.name = (dbUser as any).name;
            token.email = (dbUser as any).email;
            token.picture = (dbUser as any).image;
            token.rights_type = (dbUser as any).rights_type;
            token.subscription_type = (dbUser as any).subscription_type;
            token.subscription_expires_at = (dbUser as any).subscription_expires_at;
            token.coins = totalCoins;

            console.log('[Auth] JWT callback, data stored in token:', {
              name: token.name,
              email: token.email,
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
