-- 修复 aspect_ratio 参数，移除 ShortAPI 不支持的值
-- 更新所有 flux-1.0 模型的 aspect_ratio 参数

-- 文生图
UPDATE models
SET parameters = '[
  {
    "name": "num_images",
    "type": "int",
    "description": "The number of images to generate",
    "default": 1,
    "required": false,
    "enum": [1, 2, 4, 8]
  },
  {
    "name": "aspect_ratio",
    "type": "string",
    "description": "The aspect ratio of the generated image",
    "required": true,
    "enum": ["1:1", "2:3", "3:2", "4:3", "9:16", "16:9", "21:9"]
  },
  {
    "name": "performance",
    "type": "string",
    "description": "Generation performance mode",
    "default": "Quality",
    "required": false,
    "enum": ["Speed", "Quality"]
  }
]'::jsonb
WHERE name = 'flux-1.0' AND type = 'text2image';

-- 图生图
UPDATE models
SET parameters = '[
  {
    "name": "num_images",
    "type": "int",
    "description": "The number of images to generate",
    "default": 1,
    "required": false,
    "enum": [1, 2, 4, 8]
  },
  {
    "name": "aspect_ratio",
    "type": "string",
    "description": "The aspect ratio of the generated image",
    "required": true,
    "enum": ["1:1", "2:3", "3:2", "4:3", "9:16", "16:9", "21:9"]
  },
  {
    "name": "performance",
    "type": "string",
    "description": "Generation performance mode",
    "default": "Quality",
    "required": false,
    "enum": ["Speed", "Quality"]
  }
]'::jsonb
WHERE name = 'flux-1.0' AND type = 'image2image';
