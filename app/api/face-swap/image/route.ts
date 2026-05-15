import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['files.swapfaces.ai', 'swapfaces.ai'];

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h))) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    const imageResponse = await fetch(url, {
      headers: { Accept: 'image/*' },
    });

    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const buffer = await imageResponse.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Face-Swap Image Proxy] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy failed' },
      { status: 500 }
    );
  }
}
