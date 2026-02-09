'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // 每5分钟自动刷新session
      refetchOnWindowFocus={true} // 窗口聚焦时刷新session
    >
      {children}
    </SessionProvider>
  );
}
