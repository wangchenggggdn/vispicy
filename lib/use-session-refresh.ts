import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * 强制刷新 session 的 hook
 * 当需要立即获取最新的用户数据（如金币数量）时使用
 */
export function useForceSessionRefresh() {
  const { data: session, update } = useSession();

  const refresh = async () => {
    await update();
    // 刷新页面以确保所有组件都获取到最新数据
    window.location.reload();
  };

  return { session, refresh };
}

/**
 * 定期刷新 session 的 hook
 * @param intervalSeconds 刷新间隔（秒），默认 60 秒
 */
export function useAutoSessionRefresh(intervalSeconds: number = 60) {
  const { update } = useSession();

  useEffect(() => {
    const interval = setInterval(async () => {
      await update();
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [update, intervalSeconds]);
}
