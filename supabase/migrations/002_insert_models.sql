-- 插入文生图模型
INSERT INTO models (name, title, type, shortapi, price, description, parameters, created_at) VALUES
  ('Flux', 'Flux Pro', 'text2image', 'flux-schnell', 1, '高质量的图像生成模型，适合各种风格的创作', '[]', NOW()),
  ('SDXL', 'Stable Diffusion XL', 'text2image', 'sd-xl', 2, '强大的开源文生图模型，支持多种艺术风格', '[]', NOW());

-- 插入图生图模型
INSERT INTO models (name, title, type, shortapi, price, description, parameters, created_at) VALUES
  ('SDXL Img2Img', 'SDXL 图生图', 'image2image', 'sd-xl-img2img', 2, '基于SDXL的图生图模型，可以进行风格转换和图像编辑', '[]', NOW());

-- 插入文生视频模型
INSERT INTO models (name, title, type, shortapi, price, description, parameters, created_at) VALUES
  ('Kling', '可灵 AI', 'text2video', 'kling-v1', 10, '高质量的视频生成模型，生成逼真的视频内容', '[]', NOW()),
  ('Luma', 'Luma Dream Machine', 'text2video', 'luma-dream-machine', 8, '强大的文生视频模型，支持多种场景和风格', '[]', NOW());

-- 插入图生视频模型
INSERT INTO models (name, title, type, shortapi, price, description, parameters, created_at) VALUES
  ('Kling Img2Vid', '可灵 图生视频', 'image2video', 'kling-img2vid', 5, '将静态图片转化为动态视频，保持高画质', '[]', NOW()),
  ('Luma Img2Vid', 'Luma 图生视频', 'image2video', 'luma-img2vid', 4, '图片转视频模型，生成流畅的视频动画', '[]', NOW());
