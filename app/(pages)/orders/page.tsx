'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { History, Calendar, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: orders, isLoading } = useSWR(
    session?.user ? '/api/orders' : null,
    fetcher
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/api/auth/signin');
    return null;
  }

  const getSubscriptionLabel = (type: string | null) => {
    if (!type) return '';
    const labels: Record<string, string> = {
      basic: 'Basic',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/user"
            className="inline-flex items-center text-gray-600 hover:text-red-600 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <History className="w-8 h-8 mr-3 text-red-600" />
            Order History
          </h1>
          <p className="text-gray-600 mt-2">View all your payment and subscription orders</p>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Coins</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: {
                    id: string;
                    type: string;
                    subscription_type?: string;
                    amount: number;
                    coins?: number;
                    status: string;
                    created_at: string;
                  }) => {
                    const statusConfig = {
                      completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
                      pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
                      failed: { label: 'Failed', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
                    };
                    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                    const StatusIcon = config.icon;

                    return (
                      <tr key={order.id} className="border-b hover:bg-red-50 transition">
                        <td className="py-4 px-6">
                          <code className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {order.id.slice(0, 12)}...
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {order.type === 'subscription' ? 'Subscription' : order.type === 'recharge' ? 'Recharge' : 'Task'}
                            </span>
                            {order.subscription_type && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {getSubscriptionLabel(order.subscription_type)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          {order.coins !== undefined ? (
                            <span className="text-sm font-medium text-yellow-600">
                              +{order.coins} Coins
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{config.label}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2" />
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg mb-2">No Orders Yet</p>
              <p className="text-gray-400 text-sm">You haven't made any payments or subscriptions yet</p>
              <Link
                href="/user"
                className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Back to Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
