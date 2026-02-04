'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Loader2, Bug } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl: window.location.href });
    } catch (error) {
      console.error('Login error:', error);
      setLoading(null);
    }
  };

  // 模拟登录（开发测试用）
  const handleMockLogin = async () => {
    setLoading('mock');
    try {
      // 生成有效的 UUID v4 格式 ID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      // 模拟用户信息
      const mockUser = {
        id: generateUUID(), // 使用有效的 UUID 格式
        email: 'test@vicraft.com',
        name: 'Test User',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
      };

      console.log('[Mock Login] Initiating mock login with user:', mockUser);

      // 调用模拟登录 API
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('[Mock Login] Success:', data.user);

        // 关闭弹窗
        onClose();

        // 刷新页面以显示登录状态
        window.location.reload();
      } else {
        console.error('[Mock Login] Failed:', data.error);
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('[Mock Login] Error:', error);
      alert('Login failed, please try again');
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  // 使用 Portal 渲染到 body，确保弹窗在整个页面中心显示
  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ViCraft</h2>
          <p className="text-gray-600">Sign in to use AI creative tools</p>
        </div>

        {/* 登录按钮 */}
        <div className="space-y-4">
          {/* 模拟登录（开发测试） */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleMockLogin}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'mock' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Bug className="w-5 h-5" />
              )}
              <span className="font-medium">
                {loading === 'mock' ? 'Mock login...' : 'Mock Login (for testing)'}
              </span>
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Google 登录 */}
          <button
            onClick={() => handleLogin('google')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="text-gray-700 font-medium">
              {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Apple 登录 */}
          <button
            onClick={() => handleLogin('apple')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'apple' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65-.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            )}
            <span className="text-gray-700 font-medium">
              {loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
            </span>
          </button>
        </div>

        {/* 开发模式提示 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              💡 Dev Mode: Use "Mock Login" for quick testing
            </p>
          </div>
        )}

        {/* 提示信息 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>,
    document.body
  );
}
