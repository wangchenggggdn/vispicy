'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * 定期刷新 session 的 hook
 * 用于确保前端显示的用户数据（如金币）与数据库保持同步
 *
 * @param intervalSeconds 刷新间隔（秒），默认 60 秒
 *
 * 使用示例：
 * ```tsx
 * function MyComponent() {
 *   useAutoSessionRefresh(60); // 每60秒刷新一次
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAutoSessionRefresh(intervalSeconds: number = 60) {
  const { data: session, update } = useSession();

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      console.log('[Session] Auto-refreshing session...');
      await update();
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [session, update, intervalSeconds]);
}

/**
 * 获取强制刷新 session 的函数
 *
 * 使用示例：
 * ```tsx
 * function MyComponent() {
 *   const { refresh } = useForceRefresh();
 *
 *   const handleButtonClick = async () => {
 *     // 执行某些操作后，强制刷新session
 *     await refresh();
 *   };
 *
 *   return <button onClick={handleButtonClick}>操作并刷新</button>;
 * }
 * ```
 */
export function useForceRefresh() {
  const { update } = useSession();

  const refresh = async () => {
    console.log('[Session] Force refreshing session...');
    await update();
    // 刷新页面以确保所有组件都获取到最新数据
    window.location.reload();
  };

  return { refresh };
}
