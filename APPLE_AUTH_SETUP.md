# Apple Sign In 配置指南

## 配置步骤

### 1. 注册 Apple Developer Program

如果还没有注册，需要先加入 [Apple Developer Program](https://developer.apple.com/programs/)（需要 $99/年）

### 2. 创建 App ID

1. 访问 [Apple Developer Dashboard](https://developer.apple.com/dashboard/)
2. 进入 **Certificates, Identifiers & Profiles**
3. 选择 **Identifiers** > **+** 创建新的 **App ID**
4. 选择 **App IDs** > **App**
5. 填写信息：
   - **Description**: ViCraft
   - **Bundle ID**: 使用反向域名格式，如 `com.yourcompany.vicraft`
6. 勾选 **Sign In with Apple** capability
7. 点击 **Continue** > **Register**

### 3. 创建 Services ID

1. 在 **Certificates, Identifiers & Profiles** 中
2. 选择 **Identifiers** > **+** > **Services ID**
3. 填写信息：
   - **Description**: ViCraft Web
   - **Bundle ID**: `com.yourcompany.vicraft.web`
4. 点击 **Continue** > **Register**

### 4. 配置 Sign In with Apple

1. 在刚才创建的 Services ID 中
2. 勾选 **Sign In with Apple**
3. 配置 **Return URLs**:
   - `http://localhost:3000/api/auth/callback/apple` (开发环境)
   - `https://yourdomain.com/api/auth/callback/apple` (生产环境)
4. 点击 **Save**

### 5. 创建 Secret Key

1. 在 **Certificates, Identifiers & Profiles** 中
2. 选择 **Keys** > **+** 创建新密钥
3. 填写：
   - **Key Name**: ViCraft Auth Key
   - 勾选 **Sign In with Apple**
4. 点击 **Configure** 并选择刚才创建的 App ID
5. 点击 **Continue** > **Register**
6. **重要**: 下载生成的 `.p8` 文件（只能下载一次！）
7. 记录以下信息：
   - **Key ID**: 10字符的字符串（在 Keys 列表中）
   - **Team ID**: 在 Membership 页面可以找到

### 6. 配置环境变量

在 `.env.local` 文件中添加：

```env
# Apple Sign In
APPLE_ID=com.yourcompany.vicraft.web
APPLE_SECRET=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
(完整的 .p8 文件内容)
-----END PRIVATE KEY-----
APPLE_TEAM_ID=YOUR_TEAM_ID

# Google Sign In
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
```

### 7. 生成 Token

NextAuth 需要 JWT 格式的 secret。从 `.p8` 文件生成：

```bash
# 安装依赖
npm install --save-dev @ts-rest/core

# 或使用在线工具生成 JWT
# 访问: https://jwt.io/
```

或者直接使用 `.p8` 文件的内容作为 `APPLE_SECRET`。

### 8. 测试

重启开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000，点击"立即登录"，选择 Apple 登录。

## 常见问题

### 1. "invalid_client" 错误

- 检查 `APPLE_ID` 是否正确
- 确认 Services ID 已启用 Sign In with Apple
- 确认 Return URLs 配置正确

### 2. "invalid_grant" 错误

- 检查 Secret Key 是否正确
- 确认 Secret Key 没有过期
- 检查 Key ID 和 Team ID 是否匹配

### 3. 开发环境测试

在开发环境中，Apple Sign In 可能需要：
- 使用 HTTPS 或 localhost
- 添加测试用户到 Apple Developer 账户

### 4. 生产环境部署

生产环境必须：
- 使用 HTTPS
- 配置正确的域名 Return URL
- 在 Apple Developer 中配置正确的域名

## 其他资源

- [Apple Sign In JS Documentation](https://developer.apple.com/documentation/signinwithapplejs)
- [NextAuth Apple Provider Docs](https://next-auth.js.org/providers/apple)
- [Apple Developer Documentation](https://developer.apple.com/documentation/sign_in_with_apple)
