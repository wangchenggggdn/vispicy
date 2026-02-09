'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Coins, Zap, Crown, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

export const dynamic = 'force-dynamic';

interface Plan {
  id: string;
  name: string;
  coins: number;
  price: number;
  originalPrice?: number;
  period: 'week' | 'year';
  discount?: string;
  popular?: boolean;
  features: {
    speed: string;
    imageDiscount: string;
    videoDiscount: string;
    support: boolean;
  };
}

const plans: Record<string, Plan[]> = {
  week: [
    {
      id: 'lite',
      name: 'Lite',
      coins: 600,
      price: 7.99,
      period: 'week',
      features: {
        speed: '1.0x',
        imageDiscount: '70% Off',
        videoDiscount: '70% Off',
        support: false,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      coins: 1200,
      price: 9.99,
      originalPrice: 19.99,
      period: 'week',
      discount: '50% OFF',
      popular: true,
      features: {
        speed: '1.5x',
        imageDiscount: '50% Off',
        videoDiscount: '50% Off',
        support: true,
      },
    },
    {
      id: 'max',
      name: 'Max',
      coins: 3500,
      price: 29.99,
      originalPrice: 99.99,
      period: 'week',
      discount: '70% OFF',
      features: {
        speed: '2.0x',
        imageDiscount: 'Free',
        videoDiscount: '30% Off',
        support: true,
      },
    },
  ],
  year: [
    {
      id: 'lite',
      name: 'Lite',
      coins: 4000,
      price: 39.99,
      period: 'year',
      features: {
        speed: '1.0x',
        imageDiscount: '70% Off',
        videoDiscount: '70% Off',
        support: false,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      coins: 8000,
      price: 69.99,
      originalPrice: 139.98,
      period: 'year',
      discount: '50% OFF',
      popular: true,
      features: {
        speed: '1.5x',
        imageDiscount: '50% Off',
        videoDiscount: '50% Off',
        support: true,
      },
    },
    {
      id: 'max',
      name: 'Max',
      coins: 25000,
      price: 169,
      originalPrice: 499.99,
      period: 'year',
      discount: '70% OFF',
      features: {
        speed: '2.0x',
        imageDiscount: 'Free',
        videoDiscount: '30% Off',
        support: true,
      },
    },
  ],
};

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 URL 参数读取预选的套餐和周期
  const preselectedPlan = searchParams.get('plan') as string | null;
  const preselectedCycle = searchParams.get('cycle') as string | null;

  const [billingCycle, setBillingCycle] = useState<'week' | 'year'>(
    preselectedCycle === 'yearly' ? 'year' : 'week'
  );
  const [selectedPlan, setSelectedPlan] = useState<string>(preselectedPlan || 'pro');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 当 URL 参数改变时更新状态
  useEffect(() => {
    if (preselectedPlan) {
      setSelectedPlan(preselectedPlan);
    }
    if (preselectedCycle === 'yearly') {
      setBillingCycle('year');
    } else if (preselectedCycle === 'weekly') {
      setBillingCycle('week');
    }
  }, [preselectedPlan, preselectedCycle]);

  const currentPlans = plans[billingCycle];
  const selectedPlanData = currentPlans.find((p) => p.id === selectedPlan);

  const handlePurchase = async () => {
    // Check if user is logged in
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    // User is logged in, proceed with purchase
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscription',
          planId: selectedPlan,
          billingCycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Purchase] Error:', data.error);
        alert(`Purchase failed: ${data.error || 'Unknown error'}`);
        return;
      }

      if (data.success && data.approveUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approveUrl;
      } else {
        alert('Failed to process payment. Please try again.');
      }
    } catch (error) {
      console.error('[Purchase] Error:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/user"
          className="inline-flex items-center text-gray-600 hover:text-red-600 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get More Coins
          </h1>
          <p className="text-xl text-gray-600">
            Unlock premium features and become a Pro member
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-full p-1 flex items-center shadow-inner">
            <button
              onClick={() => setBillingCycle('week')}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                billingCycle === 'week'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle('year')}
              className={`px-6 py-4 rounded-full font-semibold transition relative ${
                billingCycle === 'year'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <span className="mr-6">Yearly</span>
              <span className="absolute right-0 -top-4 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                Save 50%
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Features Table */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Features</h2>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b border-gray-200">
              <div className="font-semibold">Features</div>
              <div className="text-center font-semibold text-gray-600">Lite</div>
              <div className="text-center font-semibold text-gray-600">Pro</div>
              <div className="text-center font-semibold text-gray-600">Max</div>
            </div>

            {/* Coins */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Coins</div>
              {currentPlans.map((plan) => (
                <div key={plan.id} className="text-center">
                  <span className="text-red-600 font-bold text-xl">{plan.coins.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Generation Speed */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Speed</div>
              <div className="text-center">
                <span className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold">1.0x</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">1.5x</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">2.0x</span>
              </div>
            </div>

            {/* HD Output */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">HD Output</div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>

            {/* Image Features */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Image Features</div>
              <div className="text-center">
                <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">70% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">50% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">Free</span>
              </div>
            </div>

            {/* Video Features */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Video Features</div>
              <div className="text-center">
                <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">70% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">50% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">30% Off</span>
              </div>
            </div>

            {/* Video Models Access */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Video Models</div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>

            {/* Image Models Access */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Image Models</div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>

            {/* Dedicated Support */}
            <div className="grid grid-cols-4 gap-4">
              <div className="font-medium">Priority Support</div>
              <div className="text-center text-red-500">
                <X className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-green-600">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>
          </div>

          {/* Right: Pricing Cards */}
          <div className="space-y-4">
            {currentPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white rounded-xl p-5 border-2 transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-red-600 shadow-lg shadow-red-600/20'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                } ${plan.popular ? 'ring-2 ring-red-100' : ''}`}
              >
                {/* Discount Badge */}
                {plan.discount && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                    {plan.discount}
                  </div>
                )}

                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    Popular
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Radio Button */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPlan === plan.id
                        ? 'border-red-600 bg-red-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Plan Name & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>

                      {/* Price */}
                      <div className="text-right">
                        <div className="flex items-baseline justify-end">
                          <span className="text-2xl font-bold text-red-600">
                            ${plan.price}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            /{plan.period === 'week' ? 'week' : 'year'}
                          </span>
                        </div>
                        {plan.originalPrice && (
                          <div className="text-gray-400 line-through text-xs">
                            ${plan.originalPrice}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Coins & Features */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <Coins className="w-4 h-4" />
                        <span className="font-semibold">{plan.coins.toLocaleString()} Coins</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{plan.features.speed}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Crown className="w-3.5 h-3.5" />
                        <span>{plan.features.imageDiscount}</span>
                      </div>
                      {plan.features.support && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-xs">Support</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Buy Now Button */}
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className={`w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xl rounded-xl transition transform hover:scale-[1.02] shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none${
                isProcessing ? ' opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </button>

            {/* Trust Badge */}
            <div className="text-center text-sm text-gray-500">
              <p>Secure Payment · 7-Day Refund · 24/7 Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
