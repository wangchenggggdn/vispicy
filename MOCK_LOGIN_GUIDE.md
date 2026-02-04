# 模拟登录使用指南

## ✅ 已完成的功能

### 1. 模拟登录按钮
- **位置**: 登录弹窗顶部（仅开发环境显示）
- **图标**: 🐛 Bug 图标 + 渐变色按钮
- **功能**: 一键模拟登录，无需配置 Google OAuth

### 2. 模拟用户信息
```javascript
{
  id: 'mock-user-时间戳',
  email: 'test@vicraft.com',
  name: '测试用户',
  image: '随机生成的头像'
}
```

### 3. 金币机制
- ✅ **新用户**: 自动获得 **50 金币**
- ✅ **老用户**: 保持原有金币数量

### 4. 数据库操作
- 自动创建或更新 users 表记录
- 设置初始金币为 50
- 记录登录时间

## 🚀 使用方法

### 步骤 1: 启动开发服务器
```bash
npm run dev
```

### 步骤 2: 打开浏览器
访问 http://localhost:3000

### 步骤 3: 点击登录按钮
- 右上角 "登录" 按钮
- 或首页 "立即登录" 按钮

### 步骤 4: 选择模拟登录
- 点击紫色的 **"模拟登录（测试用）"** 按钮
- 等待 1-2 秒

### 步骤 5: 登录成功
- 页面自动刷新
- 显示用户信息
- 显示金币数量（50 金币）

## 🎯 测试流程

### 完整测试流程：

1. **首次登录**
   - 点击模拟登录
   - 创建新用户
   - 获得 50 金币
   - 页面显示用户名和头像

2. **再次登录**
   - 点击模拟登录
   - 识别为已存在用户
   - 更新用户信息
   - 保持原有金币数量

3. **使用功能**
   - 文生图：消耗金币生成图片
   - 图生图：消耗金币生成图片
   - 文生视频：消耗金币生成视频
   - 图生视频：消耗金币生成视频

## 📊 模拟用户数据

### 用户信息
- **邮箱**: test@vicraft.com
- **名称**: 测试用户
- **头像**: 使用 DiceBear API 生成随机头像
- **ID**: mock-user-时间戳（每次登录可能不同）

### 金币
- **初始金币**: 50
- **用途**:
  - 文生图：1-2 金币/张
  - 图生图：2 金币/张
  - 文生视频：5-10 金币/个
  - 图生视频：4-8 金币/个

## ⚙️ 开发环境特性

模拟登录仅在以下条件启用：
```javascript
process.env.NODE_ENV === 'development'
```

### 生产环境
- 模拟登录按钮自动隐藏
- 只显示 Google 和 Apple 登录
- 返回 403 Forbidden 错误

## 🔍 调试信息

### 浏览器控制台日志

**登录请求：**
```
[Mock Login] Initiating mock login with user: {id, email, name, image}
```

**API 响应：**
```
[Mock Auth] Mock login request: {id, email, name, image}
[Mock Auth] Creating new mock user with 50 coins
[Mock Auth] New user created: xxx, 50 coins
```

**成功响应：**
```
[Mock Login] Success: {id, email, name, image, coins: 50}
```

### 数据库检查

查看 users 表：
```sql
SELECT * FROM users WHERE email = 'test@vicraft.com';
```

预期结果：
- email: test@vicraft.com
- name: 测试用户
- coins: 50
- created_at: 当前时间

## 🎮 快速测试场景

### 场景 1: 新用户首次使用
1. 点击模拟登录
2. 获得 50 金币
3. 使用文生图功能（消耗 1-2 金币）
4. 生成图片成功

### 场景 2: 余额不足测试
1. 多次使用文生图（每次 1-2 金币）
2. 当金币 < 1 时，会提示余额不足
3. 可以手动增加金币测试

### 场景 3: 多次登录
1. 第一次登录：创建用户，50 金币
2. 退出登录
3. 第二次登录：识别老用户，保持 50 金币
4. 第三次登录：仍是 50 金币（不会重复增加）

## 🔧 自定义模拟用户

如果需要使用不同的用户信息，可以修改 `components/LoginModal.tsx`:

```typescript
const mockUser = {
  id: 'custom-user-' + Date.now(),
  email: 'custom@example.com',  // 修改邮箱
  name: '自定义用户',          // 修改名称
  image: 'https://your-avatar-url', // 修改头像
};
```

## ⚠️ 注意事项

1. **仅开发环境**: 生产环境无法使用模拟登录
2. **cookie 有效期**: 7 天
3. **金币数量**: 不会因为重复登录而增加
4. **用户 ID**: 每次可能不同（基于时间戳）

## 🚀 后续配置真实登录

当准备好配置真实登录时：

1. **Google OAuth**（推荐用于开发）
   - 参考 `GOOGLE_OAUTH_SETUP.md`
   - 5 分钟即可完成配置
   - 完全免费

2. **Apple Sign In**（生产环境需要）
   - 参考 `APPLE_AUTH_SETUP.md`
   - 需要 Apple Developer Program ($99/年)
   - 上架 App Store 必需

## 📝 开发流程建议

**阶段 1：功能开发**（当前）
- ✅ 使用模拟登录
- ✅ 测试所有功能
- ✅ 验证金币扣减逻辑

**阶段 2：真实登录集成**
- ⏳ 配置 Google OAuth
- ⏳ 测试 Google 登录
- ⏳ 配置 Apple Sign In（可选）

**阶段 3：生产部署**
- ⏳ 移除或禁用模拟登录
- ⏳ 配置生产环境 OAuth
- ⏳ 上线应用

---

**现在就可以点击"模拟登录"测试整个流程了！** 🎉

模拟登录完成后，您可以：
- 看到用户头像和名称
- 看到金币数量（50）
- 使用文生图、图生图等功能
- 测试金币扣减
