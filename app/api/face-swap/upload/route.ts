import { uploadImageBuffer } from '@/lib/opengoon';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageBuffer(buffer, file.name, file.type);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('[Face-Swap Upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
