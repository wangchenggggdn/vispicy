import { NextResponse } from 'next/server';
import { calculatePrice } from '@/lib/pricing';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'vidu/vidu-q3/image-to-video';
  const taskType = searchParams.get('taskType') || 'image2video';
  const duration = searchParams.get('duration') || '5';
  const resolution = searchParams.get('resolution') || '720p';

  const params = { duration, resolution };

  const result = {
    model,
    taskType,
    params,
    calculatedPrice: calculatePrice(taskType, model, params),
    pricingConfigs: {
      'vidu/vidu-q3/text-to-video': {
        taskType: 'text2video',
        params: {
          '5_720p': { duration: '5', resolution: '720p' },
          '10_1080p': { duration: '10', resolution: '1080p' },
          '15_1080p': { duration: '15', resolution: '1080p' },
        },
      },
      'vidu/vidu-q3/image-to-video': {
        taskType: 'image2video',
        params: {
          '5_720p': { duration: '5', resolution: '720p' },
          '10_1080p': { duration: '10', resolution: '1080p' },
          '15_1080p': { duration: '15', resolution: '1080p' },
        },
      },
    },
    allTestPrices: {
      text2video: {
        'vidu/vidu-q3/text-to-video': {
          '5_720p': calculatePrice('text2video', 'vidu/vidu-q3/text-to-video', { duration: '5', resolution: '720p' }),
          '5_1080p': calculatePrice('text2video', 'vidu/vidu-q3/text-to-video', { duration: '5', resolution: '1080p' }),
          '10_720p': calculatePrice('text2video', 'vidu/vidu-q3/text-to-video', { duration: '10', resolution: '720p' }),
          '10_1080p': calculatePrice('text2video', 'vidu/vidu-q3/text-to-video', { duration: '10', resolution: '1080p' }),
          '15_720p': calculatePrice('text2video', 'vidu/vidu-q3/text-to-video', { duration: '15', resolution: '720p' }),
          '15_1080p': calculatePrice('text2video', 'vidu/vidu-q3/text-to-video', { duration: '15', resolution: '1080p' }),
        },
      },
      image2video: {
        'vidu/vidu-q3/image-to-video': {
          '5_720p': calculatePrice('image2video', 'vidu/vidu-q3/image-to-video', { duration: '5', resolution: '720p' }),
          '5_1080p': calculatePrice('image2video', 'vidu/vidu-q3/image-to-video', { duration: '5', resolution: '1080p' }),
          '10_720p': calculatePrice('image2video', 'vidu/vidu-q3/image-to-video', { duration: '10', resolution: '720p' }),
          '10_1080p': calculatePrice('image2video', 'vidu/vidu-q3/image-to-video', { duration: '10', resolution: '1080p' }),
          '15_720p': calculatePrice('image2video', 'vidu/vidu-q3/image-to-video', { duration: '15', resolution: '720p' }),
          '15_1080p': calculatePrice('image2video', 'vidu/vidu-q3/image-to-video', { duration: '15', resolution: '1080p' }),
        },
      },
    },
  };

  return NextResponse.json(result);
}
