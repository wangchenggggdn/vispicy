'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, RefreshCw, Coins } from 'lucide-react';
import LoginModal from './LoginModal';
import ChiliIcon from './ChiliIcon';
import { useCoins } from '@/hooks/use-coins';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { coins, refreshCoins, loading: coinsLoading } = useCoins(60);

  // 预加载 packages 配置数据，提升打开弹窗时的加载速度
  useSWR('/api/packages', fetcher);

  // 预加载所有模型数据，提升进入创作页时的加载速度
  // SWR 会自动缓存这些数据，当用户进入创作页时不需要等待
  useSWR('/api/models?type=text2image', fetcher);
  useSWR('/api/models?type=image2image', fetcher);
  useSWR('/api/models?type=text2video', fetcher);
  useSWR('/api/models?type=image2video', fetcher);

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-[60]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <ChiliIcon size={32} className="text-red-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Vispicy
          </h1>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link href="/text-to-image" className="text-gray-700 hover:text-red-600 transition text-sm">
            Text to Image
          </Link>
          <Link href="/image-to-image" className="text-gray-700 hover:text-red-600 transition text-sm">
            Image to Image
          </Link>
          <Link href="/text-to-video" className="text-gray-700 hover:text-red-600 transition text-sm">
            Text to Video
          </Link>
          <Link href="/image-to-video" className="text-gray-700 hover:text-red-600 transition text-sm">
            Image to Video
          </Link>
          <div className="w-px h-6 bg-gray-300"></div>

          {status === 'loading' ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : session ? (
            <>
              <Link href="/user" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition text-sm cursor-pointer">
                <User className="w-4 h-4" />
                <span>{session.user.name || 'User'}</span>
              </Link>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs ${coinsLoading ? 'opacity-50' : ''}`}>
                  {coins}
                  <Coins className="w-3 h-3 ml-1" />
                </span>
                <button
                  onClick={refreshCoins}
                  disabled={coinsLoading}
                  className="flex items-center text-gray-500 hover:text-red-600 transition disabled:opacity-50"
                  title="Refresh coins"
                >
                  <RefreshCw className={`w-4 h-4 ${coinsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>

      {/* 登录弹窗 */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
}
