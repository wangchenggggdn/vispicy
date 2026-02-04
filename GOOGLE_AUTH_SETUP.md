# Google 登录配置指南

## 1. 创建 Google OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API:
   - 搜索 "Google+ API" 并启用
4. 配置 OAuth 同意屏幕:
   - 进入 "APIs & Services" > "OAuth consent screen"
   - 选择 "External" 用户类型
   - 填写应用名称、用户支持电子邮件等必填信息
   - 添加测试用户（可选，用于测试阶段）
5. 创建 OAuth 2.0 客户端 ID:
   - 进入 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "OAuth 2.0 Client ID"
   - 应用类型选择 "Web application"
   - 添加授权的重定向 URI:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (生产环境)
   - 点击 "Create"

## 2. 配置环境变量

将获得的客户端 ID 和密钥添加到 `.env.local` 文件:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
```

生成 `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 3. 数据库用户表说明

登录成功后会自动在 `users` 表中创建/更新用户记录:

- **id**: Google 用户 ID
- **email**: Google 账户邮箱
- **name**: Google 账户名称
- **image**: Google 头像 URL
- **coins**: 初始为 0（可以通过数据库手动调整）
- **subscription_type**: 订阅类型 (weekly/yearly/null)
- **subscription_expires_at**: 订阅到期时间

## 4. 登录流程

1. 用户点击 "使用 Google 登录"
2. 跳转到 Google 授权页面
3. 授权成功后回调到应用
4. `signIn` callback:
   - 检查用户是否存在
   - 如果不存在，创建新用户（coins = 0）
   - 如果存在，更新用户信息（name、image）
5. `session` callback:
   - 从数据库加载完整的用户信息
   - 包含 coins、subscription_type 等字段

## 5. 测试用户

您可以通过以下 SQL 创建测试用户:

```sql
INSERT INTO users (id, email, name, coins)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@vicraft.com',
  '测试用户',
  10000
)
ON CONFLICT (email) DO UPDATE SET
  coins = 10000,
  updated_at = NOW();
```

## 6. Session 数据结构

登录后，session 包含以下字段:

```typescript
{
  user: {
    id: string;          // 用户 ID
    email: string;       // 用户邮箱
    name?: string;       // 用户名称
    image?: string;      // 用户头像
    coins: number;       // 金币数量
    subscriptionType?: string | null;  // 订阅类型
    subscriptionExpiresAt?: string | null; // 订阅到期时间
  }
}
```

## 7. 前端使用示例

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();

  if (session) {
    console.log('用户 ID:', session.user.id);
    console.log('用户金币:', session.user.coins);
    console.log('订阅类型:', session.user.subscriptionType);
  }

  return (
    <div>
      {session ? (
        <p>欢迎, {session.user.name}! 金币: {session.user.coins}</p>
      ) : (
        <p>请先登录</p>
      )}
    </div>
  );
}
```

## 8. 调试

登录时会在控制台输出详细日志:

- `[Auth] SignIn callback for email: xxx@xxx.com`
- `[Auth] User exists, updating profile: xxx`
- `[Auth] Creating new user: xxx`
- `[Auth] Session callback for user: xxx`
- `[Auth] User data loaded: xxx, 100, coins`

打开浏览器控制台查看这些日志来排查问题。
