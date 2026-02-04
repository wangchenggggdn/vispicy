# ViCraft - AI生成图片与视频工具站

基于Next.js构建的AI内容生成工具站，支持文生图、图生图、文生视频、图片转视频等功能。

## 功能特性

- **文生图 (Text-to-Image)**: 输入文字描述生成精美图片
- **图生图 (Image-to-Image)**: 基于参考图片生成新作品
- **文生视频 (Text-to-Video)**: 文字描述生成短视频
- **图片转视频 (Image-to-Video)**: 静态图片转化为动态视频
- **用户系统**: Google OAuth登录，金币管理
- **订阅系统**: 周订阅和年订阅计划

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Serverless Functions
- **数据库**: Supabase (PostgreSQL)
- **鉴权**: NextAuth.js
- **AI服务**: ShortAPI.ai
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd vicraft
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填写配置：

```bash
cp .env.local.example .env.local
```

需要配置的环境变量：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ShortAPI
SHORTAPI_API_KEY=your-shortapi-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 设置数据库

在 Supabase SQL 编辑器中运行 `supabase/migrations/001_initial_schema.sql` 中的SQL脚本。

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## Google OAuth 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 设置授权重定向 URI: `http://localhost:3000/api/auth/callback/google`
6. 复制 Client ID 和 Client Secret 到 `.env.local`

## 项目结构

```
vicraft/
├── app/
│   ├── (pages)/          # 页面路由组
│   │   ├── text-to-image/
│   │   ├── image-to-image/
│   │   ├── text-to-video/
│   │   ├── image-to-video/
│   │   ├── user/
│   │   └── subscription/
│   ├── api/              # API路由
│   │   ├── auth/
│   │   ├── generate/
│   │   ├── tasks/
│   │   ├── orders/
│   │   ├── subscribe/
│   │   └── callback/
│   ├── globals.css
│   └── layout.tsx
├── components/           # React组件
├── lib/                  # 工具函数和配置
│   ├── supabase.ts
│   ├── auth.ts
│   ├── shortapi.ts
│   └── utils.ts
├── types/               # TypeScript类型定义
├── supabase/
│   └── migrations/      # 数据库迁移文件
└── public/              # 静态资源
```

## 数据库表结构

### users (用户表)
- id: UUID (主键)
- email: 邮箱
- name: 姓名
- image: 头像
- coins: 金币数量
- subscription_type: 订阅类型 (weekly/yearly)
- subscription_expires_at: 订阅过期时间

### orders (订单表)
- id: UUID (主键)
- user_id: 用户ID
- type: 订单类型 (recharge/subscription/task)
- amount: 金额
- coins: 金币数量
- subscription_type: 订阅类型
- status: 状态 (pending/completed/failed)

### models (AI模型表)
- id: UUID (主键)
- name: 模型名称
- type: 类型 (text-to-image/image-to-image/text-to-video/image-to-video)
- api_model: API模型标识
- price: 价格（金币）
- parameters: 参数配置
- active: 是否启用

### tasks (任务表)
- id: UUID (主键)
- user_id: 用户ID
- model_id: 模型ID
- type: 类型
- prompt: 提示词
- status: 状态 (pending/processing/completed/failed)
- result_url: 结果URL
- job_id: ShortAPI任务ID

## API端点

### 认证
- `POST /api/auth/signin` - 登录
- `POST /api/auth/signout` - 登出

### 生成
- `POST /api/generate/text-to-image` - 文生图
- `POST /api/generate/image-to-image` - 图生图
- `POST /api/generate/text-to-video` - 文生视频
- `POST /api/generate/image-to-video` - 图片转视频

### 用户
- `GET /api/tasks` - 获取任务列表
- `GET /api/orders` - 获取订单列表
- `POST /api/subscribe` - 创建订阅

### 回调
- `POST /api/callback` - ShortAPI回调

## 金币消耗规则

- 文生图: 1金币/次
- 图生图: 2金币/次
- 文生视频: 5金币/次
- 图片转视频: 5金币/次

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 本地生产构建

```bash
npm run build
npm start
```

## 待实现功能

- [ ] 支付接口集成（微信支付/支付宝）
- [ ] 图片/视频编辑工具
- [ ] API接口开放
- [ ] 任务队列系统（使用Vercel Cron或Background Jobs）
- [ ] 邮件通知
- [ ] 管理后台

## 许可证

MIT

## 联系方式

如有问题请提交 Issue。
