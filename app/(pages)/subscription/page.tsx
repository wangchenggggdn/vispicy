'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, X, Coins, Zap, Crown, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
      coins: 4000,
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
      coins: 8000,
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
      coins: 25000,
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
  const [billingCycle, setBillingCycle] = useState<'week' | 'year'>('week');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const currentPlans = plans[billingCycle];
  const selectedPlanData = currentPlans.find((p) => p.id === selectedPlan);

  const handlePurchase = async () => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    // TODO: 实现支付流程
    alert(`Purchase: ${selectedPlanData?.name} Plan - $${selectedPlanData?.price}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/user"
          className="inline-flex items-center text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get More Coins
          </h1>
          <p className="text-xl text-yellow-400">
            Unlock premium features and become a Pro member
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 rounded-full p-1 flex items-center">
            <button
              onClick={() => setBillingCycle('week')}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                billingCycle === 'week'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle('year')}
              className={`px-8 py-3 rounded-full font-semibold transition relative ${
                billingCycle === 'year'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Save 50%
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Features Table */}
          <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400">Features</h2>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b border-gray-700">
              <div className="font-semibold">Features</div>
              <div className="text-center font-semibold text-gray-300">Lite</div>
              <div className="text-center font-semibold text-gray-300">Pro</div>
              <div className="text-center font-semibold text-gray-300">Max</div>
            </div>

            {/* Coins */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Coins</div>
              <div className="text-center">
                <span className="text-yellow-400 font-bold text-xl">4,000</span>
              </div>
              <div className="text-center">
                <span className="text-yellow-400 font-bold text-xl">8,000</span>
              </div>
              <div className="text-center">
                <span className="text-yellow-400 font-bold text-xl">25,000</span>
              </div>
            </div>

            {/* Generation Speed */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Speed</div>
              <div className="text-center">
                <span className="inline-block bg-gray-700 px-4 py-2 rounded-lg font-semibold">1.0x</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold">1.5x</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold">2.0x</span>
              </div>
            </div>

            {/* HD Output */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">HD Output</div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>

            {/* Image Features */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Image Features</div>
              <div className="text-center">
                <span className="inline-block bg-pink-500 px-4 py-2 rounded-lg font-semibold text-sm">70% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-pink-500 px-4 py-2 rounded-lg font-semibold text-sm">50% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-green-500 px-4 py-2 rounded-lg font-semibold text-sm">Free</span>
              </div>
            </div>

            {/* Video Features */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Video Features</div>
              <div className="text-center">
                <span className="inline-block bg-pink-500 px-4 py-2 rounded-lg font-semibold text-sm">70% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-pink-500 px-4 py-2 rounded-lg font-semibold text-sm">50% Off</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-pink-500 px-4 py-2 rounded-lg font-semibold text-sm">30% Off</span>
              </div>
            </div>

            {/* Video Models Access */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Video Models</div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>

            {/* Image Models Access */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="font-medium">Image Models</div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>

            {/* Dedicated Support */}
            <div className="grid grid-cols-4 gap-4">
              <div className="font-medium">Priority Support</div>
              <div className="text-center text-red-400">
                <X className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-center text-blue-400">
                <Check className="w-6 h-6 mx-auto" />
              </div>
            </div>
          </div>

          {/* Right: Pricing Cards */}
          <div className="space-y-6">
            {currentPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border-2 transition cursor-pointer hover:shadow-xl hover:shadow-yellow-500/10 ${
                  selectedPlan === plan.id
                    ? 'border-green-500 shadow-lg shadow-green-500/20'
                    : 'border-gray-700'
                } ${plan.popular ? 'ring-2 ring-yellow-500/50' : ''}`}
              >
                {/* Discount Badge */}
                {plan.discount && (
                  <div className="absolute -top-3 -right-3 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {plan.discount}
                  </div>
                )}

                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold">
                    Popular
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Radio Button */}
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          selectedPlan === plan.id
                            ? 'border-yellow-400 bg-yellow-400'
                            : 'border-gray-500'
                        }`}
                      >
                        {selectedPlan === plan.id && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                    </div>

                    {/* Coins */}
                    <div className="flex items-center mb-3 ml-9">
                      <Coins className="w-6 h-6 text-yellow-400 mr-2" />
                      <span className="text-3xl font-bold text-yellow-400">
                        {plan.coins.toLocaleString()}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="ml-9 mb-3">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-yellow-400">
                          ${plan.price}
                        </span>
                        <span className="text-gray-400 ml-2">
                          /{plan.period === 'week' ? 'week' : 'year'}
                        </span>
                      </div>
                      {plan.originalPrice && (
                        <div className="text-gray-500 line-through text-sm">
                          ${plan.originalPrice}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="ml-9 space-y-2">
                      <div className="flex items-center text-sm">
                        <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                        <span>Speed: {plan.features.speed}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Crown className="w-4 h-4 text-pink-400 mr-2" />
                        <span>Image: {plan.features.imageDiscount}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 text-blue-400 mr-2" />
                        <span>Video: {plan.features.videoDiscount}</span>
                      </div>
                      {plan.features.support && (
                        <div className="flex items-center text-sm text-green-400">
                          <Check className="w-4 h-4 mr-2" />
                          <span>Priority Support</span>
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
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-xl rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition transform hover:scale-[1.02] shadow-lg shadow-yellow-500/30"
            >
              Buy Now
            </button>

            {/* Trust Badge */}
            <div className="text-center text-sm text-gray-500">
              <p>Secure Payment · 7-Day Refund · 24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
