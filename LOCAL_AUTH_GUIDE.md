# Google & Apple 登录本地调试指南

## 一、Google 登录本地调试

### 1. 创建 Google OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API（如果还没启用）

### 2. 配置 OAuth 2.0 客户端

1. 进入 **APIs & Services** > **Credentials**
2. 点击 **Create Credentials** > **OAuth 2.0 Client ID**
3. 应用类型选择：**Web application**
4. 名称：`ViCraft (Local)`
5. **已授权的重定向 URI** 添加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. 点击 **Create**

### 3. 获取凭据

创建后会显示：
- **客户端 ID**: `xxxxx.apps.googleusercontent.com`
- **客户端密钥**: `GOCSPX-xxxxx`

### 4. 配置环境变量

在 `.env.local` 文件中添加：

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXTAUTH_SECRET=使用 openssl rand -base64 32 生成
```

生成 NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 5. 测试 Google 登录

```bash
npm run dev
```

访问 http://localhost:3000，点击登录按钮测试。

---

## 二、Apple 登录本地调试

Apple Sign In 本地调试比较特殊，需要注意以下几点：

### 方案 A：使用 Apple Developer 账号（推荐）

如果您有 Apple Developer Program 账号（$99/年）：

#### 1. 创建 Services ID

1. 访问 [Apple Developer Dashboard](https://developer.apple.com/dashboard/)
2. **Certificates, Identifiers & Profiles** > **Identifiers**
3. 点击 **+** > **Services ID**
4. 填写：
   - Description: `ViCraft Local`
   - Bundle ID: `com.vicraft.local`（这就是 APPLE_ID）
5. 勾选 **Sign In with Apple**
6. 配置 **Return URLs**:
   ```
   http://localhost:3000/api/auth/callback/apple
   ```
7. 点击 **Continue** > **Register**

#### 2. 创建私钥

1. **Keys** > 点击 **+** 创建新密钥
2. Key Name: `ViCraft Local Auth`
3. 勾选 **Sign In with Apple**
4. 点击 **Configure**，选择刚创建的 Services ID
5. 点击 **Save** > **Continue** > **Register**
6. **⚠️ 重要**: 下载 `.p8` 文件（只能下载一次！）
7. 记录 **Key ID**（10字符）

#### 3. 获取 Team ID

在 **Membership** 页面可以看到 Team ID

#### 4. 配置环境变量

```env
APPLE_ID=com.vicraft.local
APPLE_SECRET=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
（完整的 .p8 文件内容）
-----END PRIVATE KEY-----
APPLE_TEAM_ID=YOUR_TEAM_ID
```

#### 5. 本地测试

```bash
npm run dev
```

访问 http://localhost:3000，选择 Apple 登录。

---

### 方案 B：不使用 Apple Developer 账号

如果没有 Apple Developer 账号，可以使用模拟测试：

#### 选项 1：暂时禁用 Apple 登录

在 `lib/auth.ts` 中注释掉 Apple Provider：

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID || '',
    //   clientSecret: process.env.APPLE_SECRET || '',
    // }),
  ],
  // ... 其他配置
};
```

在 `components/LoginModal.tsx` 中隐藏 Apple 按钮：

```typescript
{/* Apple 登录 - 暂时隐藏 */}
{/* <button>...</button> */}
```

#### 选项 2：只使用 Google 登录

这是最简单的方案！Google 登录完全免费且容易配置。

---

## 三、常见本地调试问题

### 问题 1: redirect_uri_mismatch

**原因**: 重定向 URI 不匹配

**解决**:
- Google Console 中的 URI 必须是: `http://localhost:3000/api/auth/callback/google`
- 确保端口号正确（3000）
- 如果使用其他端口，需要更新配置

### 问题 2: Apple Sign In 不工作

**原因**: Apple 需要有效的 Services ID 和 Secret

**解决方案**:
1. 确认 Services ID 正确
2. 确认 Secret Key 没有过期
3. 确认 Return URLs 配置正确
4. 检查浏览器控制台的错误信息

### 问题 3: 400 invalid_request

**原因**: NextAuth 配置问题

**解决**:
检查 `.env.local` 中的配置：
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=必须设置
```

### 问题 4: localhost 使用 HTTPS

**Apple 限制**: Apple Sign In 通常要求 HTTPS

**本地开发例外**:
- Apple 允许 `http://localhost` 作为例外
- 确保使用 `http://localhost:3000` 而不是 `http://127.0.0.1:3000`

---

## 四、完整的环境变量配置示例

`.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=生成的随机字符串

# Google OAuth (免费，容易配置)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Apple Sign In (需要 $99/年的开发者账号)
APPLE_ID=com.vicraft.local
APPLE_SECRET=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
APPLE_TEAM_ID=YOUR_TEAM_ID

# ShortAPI
SHORTAPI_API_KEY=your-api-key
```

---

## 五、快速开始（最简单方案）

### 只用 Google 登录（推荐用于开发）

1. **配置 Google OAuth**（5分钟）
   - 访问 Google Cloud Console
   - 创建 OAuth 2.0 凭据
   - 添加 `http://localhost:3000/api/auth/callback/google`

2. **设置环境变量**
   ```env
   GOOGLE_CLIENT_ID=你的客户端ID
   GOOGLE_CLIENT_SECRET=你的客户端密钥
   NEXTAUTH_SECRET=生成的密钥
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **测试登录**
   - 访问 http://localhost:3000
   - 点击"登录"按钮
   - 选择 Google 登录

✅ 完成后就可以正常使用了！

---

## 六、调试技巧

### 1. 查看日志

登录时会在浏览器控制台看到详细日志：
```
[Auth] SignIn callback for email: xxx@gmail.com
[Auth] User exists, updating profile: xxx
[Auth] Session callback for user: xxx
```

### 2. 查看 NextAuth 日志

NextAuth 会输出详细的 OAuth 流程日志，有助于调试。

### 3. 检查数据库

登录后检查 users 表是否创建了用户记录：
```sql
SELECT * FROM users WHERE email = 'your@email.com';
```

### 4. 清除 Cookie

如果遇到问题，清除浏览器 Cookie：
```javascript
// 在浏览器控制台执行
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] +
    '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
```

---

## 七、生产环境部署注意事项

1. **更新环境变量**
   - 将 `http://localhost:3000` 改为生产域名
   - 更新 OAuth 回调 URL

2. **Google Console**
   - 添加生产环境的回调 URL: `https://yourdomain.com/api/auth/callback/google`

3. **Apple Developer**
   - 添加生产环境的 Return URL: `https://yourdomain.com/api/auth/callback/apple`

4. **使用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 配置 SSL 证书

---

## 八、推荐的开发流程

1. **第一阶段**: 只配置 Google 登录
   - 快速开始，免费，容易配置
   - 足够用于开发和测试

2. **第二阶段**: 上线前添加 Apple 登录
   - 购买 Apple Developer Program
   - 配置 Apple Sign In
   - 测试双登录功能

这样可以节省开发时间和成本！
