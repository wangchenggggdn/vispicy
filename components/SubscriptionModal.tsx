'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Check, X, Coins, Loader2 } from 'lucide-react';

// 辅助函数：格式化折扣显示
function formatDiscountBadge(discount: number): { text: string; className: string } {
  if (discount === 0) {
    return { text: 'Free', className: 'bg-green-500 px-2 py-1 rounded text-xs' };
  }
  return { text: `${discount}% Off`, className: 'bg-pink-500 px-2 py-1 rounded text-xs' };
}

interface SubscriptionPackage {
  plan_id: string;
  billing_cycle: string;
  name: string;
  description: string;
  coins: number;
  price: number;
  popular: boolean;
  image_discount: number; // 图像功能折扣百分比
  video_discount: number; // 视频功能折扣百分比
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: (planId: string, billingCycle: 'week' | 'year') => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = useState<'week' | 'year'>('week');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 使用 SWR 获取套餐配置（与 Header 使用相同的 fetcher，可以利用缓存）
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: packagesData, error: packagesError } = useSWR('/api/packages', fetcher);
  const packages = packagesData?.subscriptionPackages || [];
  const configLoading = !packagesData && !packagesError;

  // 根据 billing cycle 和 popular 设置默认选中的套餐
  useEffect(() => {
    if (packages.length > 0) {
      const popular = packages.find((p: SubscriptionPackage) =>
        p.billing_cycle === billingCycle && p.popular
      );
      const cyclePackages = packages.filter((p: SubscriptionPackage) =>
        p.billing_cycle === billingCycle
      );
      setSelectedPlan(
        popular?.plan_id ||
        (cyclePackages.length > 0 ? cyclePackages[0].plan_id : '')
      );
    }
  }, [billingCycle, packages]);

  console.log('[SubscriptionModal] Rendered with isOpen:', isOpen);

  if (!isOpen) {
    console.log('[SubscriptionModal] isOpen is false, not rendering');
    return null;
  }

  console.log('[SubscriptionModal] Rendering modal...');

  const currentPlans = packages.filter((p: SubscriptionPackage) => p.billing_cycle === billingCycle);

  // 按价格排序（从低到高），确保 Lite < Pro < Max 的顺序
  currentPlans.sort((a: SubscriptionPackage, b: SubscriptionPackage) => a.price - b.price);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planId: selectedPlan,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (data.success && data.approveUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.approveUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      console.error('[SubscriptionModal] Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Billing Toggle with Close Button */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="bg-gray-800 rounded-full p-1 flex items-center relative">
              <button
                onClick={() => setBillingCycle('week')}
                className={`px-8 py-2 rounded-full font-semibold transition text-sm ${
                  billingCycle === 'week'
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setBillingCycle('year')}
                className={`px-8 py-2 rounded-full font-semibold transition text-sm relative ${
                  billingCycle === 'year'
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  Save 50%
                </span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition absolute right-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {configLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              <span className="ml-3 text-gray-400">Loading...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No plans available
            </div>
          ) : (
            <>
              {/* Main Content - Left: Features, Right: Pricing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Features Table */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-yellow-400">Features Comparison</h3>

                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-2 mb-4 pb-3 border-b border-gray-700 text-xs">
                    <div className="font-semibold text-white text-sm">Features</div>
                    {currentPlans.map((plan) => (
                      <div key={plan.plan_id} className="text-center font-semibold text-white text-sm">
                        {plan.name}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="space-y-3 text-sm">
                    {/* Coins */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Coins</div>
                      {currentPlans.map((plan) => (
                        <div key={plan.plan_id} className="text-center text-yellow-400 font-semibold">
                          {plan.coins.toLocaleString()}
                        </div>
                      ))}
                    </div>

                    {/* Speed */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Speed</div>
                      {currentPlans.map((plan) => (
                        <div key={plan.plan_id} className="text-center">
                          {plan.plan_id === 'lite' && (
                            <span className="inline-block bg-gray-700 px-2 py-1 rounded text-xs">1.0x</span>
                          )}
                          {plan.plan_id === 'pro' && (
                            <span className="inline-block bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">1.5x</span>
                          )}
                          {plan.plan_id === 'max' && (
                            <span className="inline-block bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">2.0x</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* HD */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">HD Output</div>
                      {currentPlans.map((plan) => (
                        <div key={plan.plan_id} className="text-center text-blue-400">
                          <Check className="w-4 h-4 mx-auto" />
                        </div>
                      ))}
                    </div>

                    {/* Image Features */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Image Features</div>
                      {currentPlans.map((plan) => {
                        const { text, className } = formatDiscountBadge(plan.image_discount);
                        return (
                          <div key={plan.plan_id} className="text-center">
                            <span className={`inline-block ${className}`}>{text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Video Features */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Video Features</div>
                      {currentPlans.map((plan) => {
                        const { text, className } = formatDiscountBadge(plan.video_discount);
                        return (
                          <div key={plan.plan_id} className="text-center">
                            <span className={`inline-block ${className}`}>{text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Video Models */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Video Models</div>
                      {currentPlans.map((plan) => (
                        <div key={plan.plan_id} className="text-center text-blue-400">
                          <Check className="w-4 h-4 mx-auto" />
                        </div>
                      ))}
                    </div>

                    {/* Image Models */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Image Models</div>
                      {currentPlans.map((plan) => (
                        <div key={plan.plan_id} className="text-center text-blue-400">
                          <Check className="w-4 h-4 mx-auto" />
                        </div>
                      ))}
                    </div>

                    {/* Support */}
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <div className="font-medium text-gray-300">Priority Support</div>
                      {currentPlans.map((plan) => (
                        <div key={plan.plan_id} className="text-center">
                          {plan.plan_id === 'lite' ? (
                            <div className="text-red-400"><X className="w-4 h-4 mx-auto" /></div>
                          ) : (
                            <div className="text-blue-400"><Check className="w-4 h-4 mx-auto" /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Pricing Cards */}
                <div className="space-y-4">
                  {currentPlans.map((plan) => (
                    <div
                      key={plan.plan_id}
                      onClick={() => setSelectedPlan(plan.plan_id)}
                      className={`relative bg-gray-800/50 rounded-xl p-5 border-2 transition cursor-pointer hover:shadow-xl ${
                        selectedPlan === plan.plan_id
                          ? 'border-green-500 shadow-lg'
                          : 'border-gray-700'
                      } ${plan.popular ? 'ring-2 ring-yellow-500/30' : ''}`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-0.5 rounded-full text-xs font-bold">
                          Popular
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          {/* Radio Button */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                              selectedPlan === plan.plan_id
                                ? 'border-yellow-400 bg-yellow-400'
                                : 'border-gray-500'
                            }`}
                          >
                            {selectedPlan === plan.plan_id && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        </div>

                        {/* Price and Coins */}
                        <div className="text-right">
                          <div className="flex items-baseline justify-end mb-1">
                            <span className="text-2xl font-bold text-yellow-400">
                              ${plan.price}
                            </span>
                            <span className="text-gray-400 text-sm ml-1">
                              /{plan.billing_cycle === 'week' ? 'week' : 'year'}
                            </span>
                          </div>
                          <div className="flex items-center justify-end mt-1 text-sm text-yellow-400">
                            <Coins className="w-3 h-3 mr-1" />
                            <span className="font-semibold">{plan.coins.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Subscribe Button */}
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || configLoading || !selectedPlan}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition transform hover:scale-[1.01] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Processing...' : configLoading ? 'Loading...' : 'Subscribe'}
                  </button>
                  <p className="text-center text-xs text-gray-500">
                    Secure Payment · 7-Day Refund · 24/7 Support
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
