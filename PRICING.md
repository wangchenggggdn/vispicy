# 价格系统配置说明

## 概述

价格系统位于 `lib/pricing.ts`，采用集中式配置管理，支持：
- 基础价格
- 单位价格（如每张图片、每秒视频）
- 参数倍率（如分辨率、时长）

## 当前价格配置

### 文生图 (text2image)
- **flux-v1-beta**: 100 金币起，每多生成一张图 +20 金币
- **nano-banana-v1**: 200 金币起，每多生成一张图 +20 金币

### 图生图 (image2image)
- **flux-v1-beta**: 300 金币起，每多生成一张图 +20 金币
- **nano-banana-v1**: 100 金币起，每多生成一张图 +20 金币

### 文生视频 (text2video)
- **vidu-v1**:
  - 5秒 720p: 600 金币
  - 5秒 1080p: 800 金币
  - 10秒 720p: 1000 金币
  - 10秒 1080p: 1200 金币
- **kling-v2.6**:
  - 5秒: 600 金币
  - 10秒: 1000 金币

### 图生视频 (image2video)
- 同文生视频定价

## 添加新模型定价

### 示例 1: 简单定价（基础价格 + 单位价格）

```typescript
// 在 lib/pricing.ts 的 PRICING_RULES 中添加
text2image: {
  // ... 现有模型

  // 新模型：基础价格 150 金币，每张额外图片 +30 金币
  'new-model-v1': {
    basePrice: 150,
    unitPrice: 30,
    unitParam: 'num_images',
  },
}
```

### 示例 2: 复杂定价（带倍率）

```typescript
text2video: {
  // ... 现有模型

  // 新模型：根据时长和分辨率定价
  'new-video-model': {
    basePrice: 500, // 默认 5秒 720p
    multipliers: {
      resolution: {
        '720p': 1,
        '1080p': 1.5,
        '4k': 3,
      },
      duration: {
        5: 1,
        10: 1.8,
        15: 2.5,
      },
    },
  },
}
```

### 示例 3: 固定价格

```typescript
image2image: {
  // ... 现有模型

  // 固定价格模型
  'fixed-price-model': {
    basePrice: 250,
  },
}
```

## 价格计算逻辑

1. **基础价格**: 每个模型的起拍价
2. **单位价格**: 如果配置了 `unitPrice` 和 `unitParam`，会根据参数值额外收费
   - 计算: `basePrice + (paramValue - 1) * unitPrice`
3. **参数倍率**: 如果配置了 `multipliers`，会根据参数值应用倍率
   - 先应用单位价格计算
   - 然后应用所有倍率
   - 最终结果四舍五入为整数

## API 集成

所有生成 API 已集成扣费系统：
- ✅ `/api/generate/text-to-image`
- ✅ `/api/generate/image-to-image`
- ✅ `/api/generate/text-to-video`
- ✅ `/api/generate/image-to-video`

### 扣费流程

1. 验证用户登录状态
2. 获取用户当前金币余额
3. 计算任务价格
4. 检查余额是否充足
5. 扣除金币
6. 创建生成任务

### 错误处理

- **401 Unauthorized**: 用户未登录
- **402 Payment Required**: 金币不足
  ```json
  {
    "error": "金币不足。需要 100 金币，当前余额 50 金币",
    "currentCoins": 50,
    "requiredCoins": 100
  }
  ```

## 使用示例

### 前端显示价格

```typescript
import { calculatePrice, getPriceDescription } from '@/lib/pricing';

// 获取价格描述（用于UI显示）
const description = getPriceDescription('text2image', 'flux-v1-beta');
// 返回: "100 金币起，每额外1张+20金币"

// 计算实际价格
const price = calculatePrice('text2image', 'flux-v1-beta', {
  num_images: 4, // 生成4张图
  prompt: '...',
});
// 计算: 100 + (4-1) * 20 = 160 金币
```

### 检查用户是否负担得起

```typescript
import { canAfford } from '@/lib/pricing';

const affordable = canAfford(
  user.coins,      // 用户当前金币
  'text2image',    // 任务类型
  'flux-v1-beta',  // 模型
  { num_images: 4 } // 参数
);
// 返回: true 或 false
```

## 修改现有价格

直接编辑 `lib/pricing.ts` 中的 `PRICING_RULES` 对象，修改后会立即生效（无需重启服务器）。

```typescript
// 例如：修改 flux 价格
text2image: {
  'flux-v1-beta': {
    basePrice: 120, // 从 100 改为 120
    unitPrice: 25,  // 从 20 改为 25
    unitParam: 'num_images',
  },
}
```

## 注意事项

1. **模型 shortapi 必须匹配**: 价格配置中的模型名称必须与数据库中的 `shortapi` 字段完全一致
2. **参数名称匹配**: `unitParam` 必须与实际发送给 API 的参数名称一致
3. **倍率参数**: `multipliers` 中的键名必须与实际参数名称匹配
4. **默认价格**: 如果找不到价格配置，系统会使用默认价格 100 金币

## 调试

价格计算会在控制台输出详细日志：

```
[Pricing] text2image/flux-v1-beta: {
  basePrice: 100,
  params: { num_images: 4 },
  calculatedPrice: 160
}
```

查看这些日志可以帮助调试价格计算是否正确。
