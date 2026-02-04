export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCoins(coins: number): string {
  return coins.toString();
}

export function getSubscriptionLabel(type: string | null | undefined): string {
  if (!type) return '无订阅';

  // 首字母大写
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getSubscriptionStatus(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

// 订阅更新事件名称
export const SUBSCRIPTION_UPDATE_EVENT = 'subscription-update';

// 触发订阅更新事件
export function dispatchSubscriptionUpdate() {
  window.dispatchEvent(new CustomEvent(SUBSCRIPTION_UPDATE_EVENT));
}

