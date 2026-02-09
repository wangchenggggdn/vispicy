import { NextResponse } from 'next/server';
import { createContactMessage } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('[Contact] Received contact form submission');

    const body = await request.json();
    const { name, email, subject, message } = body;

    // 验证必填字段
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 验证 subject 是否合法
    const validSubjects = ['general', 'support', 'sales', 'billing', 'partnership', 'feedback', 'other'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject' },
        { status: 400 }
      );
    }

    // 获取当前会话（可选）
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // 保存到数据库
    const contactMessage = await createContactMessage({
      name,
      email,
      subject,
      message,
      user_id: userId,
    });

    console.log('[Contact] Message saved successfully:', contactMessage.id);

    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll get back to you soon.',
      id: contactMessage.id,
    });
  } catch (error) {
    console.error('[Contact] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
