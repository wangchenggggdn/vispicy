import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 更新图生图模型
    const { data: img2img, error: error1 } = await supabase
      .from('models')
      .update({
        parameters: [
          {
            name: "num_images",
            type: "int",
            description: "The number of images to generate",
            default: 1,
            required: false,
            enum: [1, 2, 4, 8]
          },
          {
            name: "aspect_ratio",
            type: "string",
            description: "The aspect ratio of the generated image",
            required: true,
            enum: ["1:1", "2:3", "3:2", "4:3", "9:16", "16:9", "21:9"]
          },
          {
            name: "performance",
            type: "string",
            description: "Generation performance mode",
            default: "Quality",
            required: false,
            enum: ["Speed", "Quality"]
          }
        ]
      })
      .eq('name', 'flux-1.0')
      .eq('type', 'image2image')
      .select();

    if (error1) {
      console.error('Error updating image2image model:', error1);
      return NextResponse.json({ error: error1.message }, { status: 500 });
    }

    // 更新文生图模型
    const { data: text2img, error: error2 } = await supabase
      .from('models')
      .update({
        parameters: [
          {
            name: "num_images",
            type: "int",
            description: "The number of images to generate",
            default: 1,
            required: false,
            enum: [1, 2, 4, 8]
          },
          {
            name: "aspect_ratio",
            type: "string",
            description: "The aspect ratio of the generated image",
            required: true,
            enum: ["1:1", "2:3", "3:2", "4:3", "9:16", "16:9", "21:9"]
          },
          {
            name: "performance",
            type: "string",
            description: "Generation performance mode",
            default: "Quality",
            required: false,
            enum: ["Speed", "Quality"]
          }
        ]
      })
      .eq('name', 'flux-1.0')
      .eq('type', 'text2image')
      .select();

    if (error2) {
      console.error('Error updating text2image model:', error2);
      return NextResponse.json({ error: error2.message }, { status: 500 });
    }

    // 更新图生视频模型
    const { data: img2vid, error: error3 } = await supabase
      .from('models')
      .update({
        parameters: [
          {
            name: "mode",
            type: "string",
            description: "Video generation mode",
            default: "pro",
            required: true,
            enum: ["turbo", "pro", "pro-fast"]
          },
          {
            name: "duration",
            type: "string",
            description: "Video Length, unit: s (seconds)",
            default: "5",
            required: true,
            enum: ["5", "10"]
          },
          {
            name: "resolution",
            type: "string",
            description: "Output video resolution",
            default: "720p",
            required: false,
            enum: ["720p", "1080p"]
          },
          {
            name: "movement_amplitude",
            type: "string",
            description: "The movement amplitude of objects in the frame",
            default: "auto",
            required: false,
            enum: ["auto", "small", "medium", "large"]
          },
          {
            name: "generate_audio",
            type: "bool",
            description: "Whether to generate original audio for the video",
            default: false,
            required: false
          },
          {
            name: "voice_id",
            type: "string",
            description: "Used to determine the timbre of the sound in the video",
            required: false
          }
        ]
      })
      .eq('name', 'vidu-q2')
      .eq('type', 'image2video')
      .select();

    if (error3) {
      console.error('Error updating image2video model:', error3);
      return NextResponse.json({ error: error3.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Models updated successfully',
      image2image: img2img,
      text2image: text2img,
      image2video: img2vid
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update models' },
      { status: 500 }
    );
  }
}
