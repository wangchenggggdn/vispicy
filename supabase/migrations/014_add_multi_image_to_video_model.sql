-- 添加多图生视频模型
INSERT INTO models (name, title, type, shortapi, description, parameters, sort_order)
VALUES (
  'Multi-Image to Video',
  'Multi-Image to Video',
  'images2video',
  'vidu/vidu-q2/reference-to-video',
  'Generate videos from multiple reference images (up to 7 images)',
  '[
    {"name": "imagecount", "type": "int", "required": 7, "description": "Upload Images (Up to 7)"},
    {"name": "duration", "type": "select", "label": "Duration (seconds)", "default": "5", "options": ["5", "10"]},
    {"name": "aspect_ratio", "type": "select", "label": "Aspect Ratio", "default": "16:9", "options": ["16:9", "9:16", "4:3", "3:4", "1:1"]},
    {"name": "resolution", "type": "select", "label": "Resolution", "default": "720p", "options": ["540p", "720p", "1080p"]}
  ]'::jsonb,
  3

)
ON CONFLICT (shortapi) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  parameters = EXCLUDED.parameters,
  sort_order = EXCLUDED.sort_order;
