-- 更新 Flux 1.0 文生图模型的参数
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
    "enum": ["1:1", "9:16", "16:9", "4:3", "3:4", "3:2", "2:3", "21:9"]
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
