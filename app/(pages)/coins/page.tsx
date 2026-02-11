'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, Coins, ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';

export const dynamic = 'force-dynamic';

interface CoinPackage {
  id: string;
  package_id: string;
  name: string;
  description: string;
  coins: number;
  bonus_coins: number;
  price: number;
  currency: string;
  popular: boolean;
  active: boolean;
  sort_order: number;
}

export default function CoinsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/coins');
      const data = await response.json();
      if (data.packages) {
        setPackages(data.packages);
        // Select the first package by default
        if (data.packages.length > 0 && !selectedPackage) {
          setSelectedPackage(data.packages[0].package_id);
        }
      }
    } catch (error) {
      console.error('[Coins] Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

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
          type: 'coins',
          packageId: selectedPackage,
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

  const getTotalCoins = (pkg: CoinPackage) => {
    return pkg.coins + (pkg.bonus_coins || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/user"
          className="inline-flex items-center text-gray-600 hover:text-red-600 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Buy Coins
          </h1>
          <p className="text-base text-gray-600 mb-4">
            Get more coins to create amazing AI content
          </p>

          {/* Upgrade to Max Card */}
          <Link
            href="/subscription"
            className="inline-block max-w-2xl w-full mx-auto bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-gray-900">
                  <span className="text-2xl">⭐</span>
                  Upgrade to Max
                </h3>
                <p className="text-sm text-gray-700">
                  Unlock all AI features, unlimited creation
                </p>
              </div>
              <div className="flex-shrink-0 bg-white/50 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {/* Left: Features */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-5 text-gray-900">Why Buy Coins?</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Flexible Usage</h3>
                  <p className="text-sm text-gray-600">Use coins for both image and video generation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Bonus Coins</h3>
                  <p className="text-sm text-gray-600">Get extra bonus coins with larger packages</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">No Expiration</h3>
                  <p className="text-sm text-gray-600">Your coins never expire, use them anytime</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Instant Delivery</h3>
                  <p className="text-sm text-gray-600">Coins are added to your account immediately after payment</p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Tip:</strong> Larger packages offer better value with bonus coins!
              </p>
            </div>
          </div>

          {/* Right: Package Cards */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-3 auto-rows-min">
            {packages.map((pkg, index) => {
              const totalCoins = getTotalCoins(pkg);
              const bonusPercentage = pkg.bonus_coins > 0
                ? Math.round((pkg.bonus_coins / pkg.coins) * 100)
                : 0;

              // 第一个套餐占两列
              const isFirst = index === 0;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.package_id)}
                  className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
                    isFirst ? 'col-span-2 p-4' : 'p-3'
                  } ${
                    selectedPackage === pkg.package_id
                      ? 'border-red-600 shadow-lg shadow-red-600/20'
                      : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                  } ${pkg.popular ? 'ring-2 ring-red-100' : ''}`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      Most Popular
                    </div>
                  )}

                  {/* Bonus Badge */}
                  {pkg.bonus_coins > 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                      {bonusPercentage}% Bonus
                    </div>
                  )}

                  {isFirst ? (
                    // 第一个套餐：占两列，完整布局
                    <div className="flex items-center gap-3">
                      {/* Radio Button */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPackage === pkg.package_id
                            ? 'border-red-600 bg-red-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPackage === pkg.package_id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      {/* Package Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{pkg.name}</h3>

                        {/* Coins & Bonus */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Coins className="w-3 h-3" />
                            <span className="font-bold text-base">
                              {totalCoins.toLocaleString()} Coins
                            </span>
                          </div>
                          {pkg.bonus_coins > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Gift className="w-2.5 h-2.5" />
                              <span className="text-xs">
                                +{pkg.bonus_coins.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {pkg.description && (
                          <p className="text-xs text-gray-500">{pkg.description}</p>
                        )}
                      </div>

                      {/* Price - Right side, vertically centered */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-baseline justify-end gap-2">
                          {pkg.bonus_coins > 0 && (
                            <span className="text-base text-gray-400 line-through">
                              ${(pkg.price / (1 - bonusPercentage / 100)).toFixed(2)}
                            </span>
                          )}
                          <span className="text-lg font-bold text-red-600">
                            ${pkg.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 其他套餐：单列，紧凑布局
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        {/* Radio Button */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedPackage === pkg.package_id
                              ? 'border-red-600 bg-red-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedPackage === pkg.package_id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{pkg.name}</h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Coins className="w-3 h-3" />
                          <span className="font-bold text-base">
                            {totalCoins.toLocaleString()}
                          </span>
                          {pkg.bonus_coins > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Gift className="w-3 h-3" />
                              <span className="text-xs">
                                +{pkg.bonus_coins.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-2">
                            {pkg.bonus_coins > 0 && (
                              <span className="text-sm text-gray-400 line-through">
                                ${(pkg.price / (1 - bonusPercentage / 100)).toFixed(2)}
                              </span>
                            )}
                            <span className="text-lg font-bold text-red-600">${pkg.price}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Buy Now Button */}
            <button
              onClick={handlePurchase}
              disabled={isProcessing || !selectedPackage}
              className={`col-span-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none${
                isProcessing ? ' opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </button>

            {/* Trust Badge */}
            <div className="col-span-2 text-center text-xs text-gray-500">
              <p>Secure Payment · Instant Delivery · 24/7 Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
