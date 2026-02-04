# Google OAuth 凭据获取详细步骤

## 步骤 1：访问 Google Cloud Console

1. 打开浏览器，访问：https://console.cloud.google.com/

2. 登录您的 Google 账号

3. 如果看到项目选择页面：
   - 点击顶部的项目选择器
   - 点击 "NEW PROJECT"（新建项目）
   - 项目名称输入：`ViCraft`
   - 点击 "CREATE"（创建）

   或者直接选择现有项目

## 步骤 2：启用 Google+ API

1. 在左侧菜单搜索栏输入 "Google+ API"
2. 点击 "Google+ API"
3. 如果显示 "ENABLE"（启用）按钮，点击它
4. 如果显示 "API is enabled"（API 已启用），跳过此步骤

## 步骤 3：配置 OAuth 同意屏幕

1. 在左侧菜单找到：**APIs & Services** > **OAuth consent screen**
2. 选择用户类型：**External**（外部）
3. 点击 "CREATE"（创建）

### 填写应用信息

**第 1 步 - OAuth 同意屏幕：**
- App name（应用名称）: `ViCraft`
- User support email（用户支持电子邮件）: 选择您的邮箱
- Developer contact information（开发者联系信息）: 您的邮箱
- 点击 "SAVE AND CONTINUE"（保存并继续）

**第 2 步 - Scopes（范围）：**
- 直接点击 "SAVE AND CONTINUE"（暂时不需要添加范围）

**第 3 步 - Test users（测试用户）：**
- 点击 "ADD USERS"
- 添加您的测试邮箱地址（开发阶段可以只添加自己的邮箱）
- 点击 "SAVE AND CONTINUE"

**第 4 步 - Summary（摘要）：**
- 点击 "BACK TO DASHBOARD"（返回控制台）

## 步骤 4：创建 OAuth 2.0 客户端 ID

1. 在左侧菜单点击：**APIs & Services** > **Credentials**
2. 页面顶部点击：**+ CREATE CREDENTIALS**（创建凭据）
3. 选择：**OAuth 2.0 Client ID**（OAuth 2.0 客户端 ID）

### 配置客户端

1. **Application type**（应用类型）：选择 **Web application**（Web 应用程序）

2. **Name**（名称）：输入 `ViCraft (Local)`

3. **Authorized JavaScript origins**（已授权的 JavaScript 源）：
   - 点击 "ADD URI"
   - 输入：`http://localhost:3000`

4. **Authorized redirect URIs**（已授权的重定向 URI）：
   - 点击 "ADD URI"
   - 输入：`http://localhost:3000/api/auth/callback/google`
   - ⚠️ 这个很重要！必须完全匹配

5. 点击 **CREATE**（创建）

## 步骤 5：复制凭据

创建后会弹出一个对话框显示您的凭据：

```
OAuth 2.0 客户端已创建

您的客户端 ID
xxxxx-xxxxx.apps.googleusercontent.com

您的客户端密钥
GOCSPX-xxxxxxxxxxxxxxxxx
```

**重要**：
- 📋 复制 **客户端 ID**（Client ID）
- 🔐 复制 **客户端密钥**（Client Secret）
- ⚠️ 客户端密钥只显示一次，请立即复制保存！

## 步骤 6：配置到项目中

1. 打开项目根目录的 `.env.local` 文件

2. 添加以下配置：
```env
GOOGLE_CLIENT_ID=xxxxx-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxx
NEXTAUTH_SECRET=需要生成一个新的
```

3. 生成 NEXTAUTH_SECRET：
   ```bash
   # 在终端执行
   openssl rand -base64 32
   ```
   复制生成的字符串到 `.env.local`

完整的 `.env.local` 应该像这样：
```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=生成的随机密钥

# Supabase（保持原有配置）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# ShortAPI（保持原有配置）
SHORTAPI_API_KEY=xxxxx
```

## 步骤 7：重启开发服务器

```bash
# 按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

## 步骤 8：测试登录

1. 打开浏览器访问：http://localhost:3000
2. 点击右上角的"登录"按钮
3. 选择"使用 Google 继续"
4. 选择您的 Google 账号
5. 授权应用
6. ✅ 登录成功！

---

## 📸 关键步骤截图说明

### 创建凭据页面

**Credentials 页面位置：**
```
Google Cloud Console
  ↓
APIs & Services
  ↓
Credentials
  ↓
+ CREATE CREDENTIALS
  ↓
OAuth 2.0 Client ID
```

### OAuth 同意屏幕位置

```
APIs & Services
  ↓
OAuth consent screen
```

---

## ⚠️ 常见问题

### 问题 1：找不到 "APIs & Services"

**解决**：
- 确保已经创建了项目
- 等待几秒让页面加载
- 刷新浏览器

### 问题 2：没有看到 "ENABLE" 按钮

**解决**：
- Google+ API 可能已经启用
- 直接进行下一步即可

### 问题 3：客户端密钥忘记复制

**解决**：
- 客户端密钥只显示一次
- 如果忘记，需要：
  1. 回到 Credentials 页面
  2. 找到创建的 OAuth 2.0 Client ID
  3. 点击右侧的铅笔图标（编辑）
  4. 但是无法再次查看密钥
  5. 只能删除重新创建

**建议**：立即复制保存到记事本！

### 问题 4：redirect_uri_mismatch 错误

**解决**：
- 检查 Google Console 中的 Redirect URI
- 必须是：`http://localhost:3000/api/auth/callback/google`
- 注意端口号（3000）

---

## 🔗 快速链接

- **Google Cloud Console**: https://console.cloud.google.com/
- **创建凭据**: https://console.cloud.google.com/apis/credentials
- **OAuth 同意屏幕**: https://console.cloud.google.com/apis/credentials/consent

---

## ✅ 配置检查清单

完成以下步骤后，您的配置应该是正确的：

- [ ] 创建了 Google Cloud 项目
- [ ] 启用了 Google+ API
- [ ] 配置了 OAuth 同意屏幕
- [ ] 添加了测试用户
- [ ] 创建了 OAuth 2.0 Client ID
- [ ] 添加了 JavaScript 源: `http://localhost:3000`
- [ ] 添加了重定向 URI: `http://localhost:3000/api/auth/callback/google`
- [ ] 复制了客户端 ID
- [ ] 复制了客户端密钥
- [ ] 更新了 `.env.local` 文件
- [ ] 生成了 NEXTAUTH_SECRET
- [ ] 重启了开发服务器
- [ ] 测试登录成功！

---

## 📝 记住这些重要信息

**需要配置到 .env.local 的内容：**

```env
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-你的客户端密钥
NEXTAUTH_SECRET=生成的随机密钥
```

**OAuth 2.0 客户端 ID 格式：**
```
xxxxx-xxxxx.apps.googleusercontent.com
```

**重定向 URI 必须精确匹配：**
```
http://localhost:3000/api/auth/callback/google
```

---

## 🎯 下一步

配置完成后：

1. **测试登录**
   - 访问 http://localhost:3000
   - 点击登录按钮
   - 选择 Google 登录

2. **检查数据库**
   - 登录成功后，users 表会自动创建新用户
   - 金币初始值为 0

3. **查看用户信息**
   - 首页会显示用户头像和名称
   - 显示当前金币数量

4. **测试功能**
   - 尝试使用文生图、图生图等功能
   - 确认金币扣减正常

---

**有任何问题都可以查看浏览器控制台的日志！** 🚀
