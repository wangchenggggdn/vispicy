'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      const token = searchParams.get('token');
      const payerId = searchParams.get('PayerID');

      console.log('[Payment Return] Params:', { token, payerId });

      // The 'token' parameter is the PayPal order ID
      const paypalOrderId = token;

      if (!paypalOrderId) {
        setStatus('error');
        setMessage('Payment parameters missing');
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      try {
        // Capture the payment
        const response = await fetch('/api/payments/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: paypalOrderId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment processing failed');
        }

        if (data.success) {
          setStatus('success');
          setMessage(`Payment successful! You've received ${data.coins?.toLocaleString()} coins`);

          // 1. 首先强制刷新 session 从数据库获取最新数据
          console.log('[Payment Return] Refreshing session from database...');
          await update();

          // 2. 等待一小段时间确保 session 更新完成
          await new Promise(resolve => setTimeout(resolve, 500));

          // 3. 再次刷新以确保获取到最新数据
          console.log('[Payment Return] Second refresh to ensure latest data...');
          await update();

          // 4. 触发前端事件通知其他组件
          if (typeof window !== 'undefined') {
            console.log('[Payment Return] Triggering coins-update event');
            window.dispatchEvent(new CustomEvent('coins-update'));
            console.log('[Payment Return] Triggering subscription-update event');
            window.dispatchEvent(new CustomEvent('subscription-update'));
          }

          // Redirect to user page after 2 seconds
          setTimeout(() => {
            router.push('/user');
          }, 2000);
        } else {
          throw new Error('Unknown payment status');
        }
      } catch (error) {
        console.error('[Payment Return] Error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Payment processing failed');
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handlePaymentReturn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing payment...</h1>
            <p className="text-gray-400">Please wait while we confirm your payment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to user page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  );
}
