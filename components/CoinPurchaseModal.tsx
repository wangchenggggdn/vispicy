'use client';

import { useState, useEffect } from 'react';
import { Coins, X, Loader2 } from 'lucide-react';

interface CoinPackage {
  package_id: string;
  name: string;
  description: string;
  coins: number;
  bonus_coins: number;
  price: number;
  popular: boolean;
}

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (packageId: string) => void;
  currentBalance?: number;
}

export default function CoinPurchaseModal({
  isOpen,
  onClose,
  onPurchase,
  currentBalance = 0,
}: CoinPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [configLoading, setConfigLoading] = useState(false);

  // 从 API 获取金币包配置
  useEffect(() => {
    const fetchPackages = async () => {
      setConfigLoading(true);
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const data = await response.json();
          setPackages(data.coinPackages || []);
          // 默认选中第一个或标记为 popular 的
          if (data.coinPackages?.length > 0) {
            const popular = data.coinPackages.find((p: CoinPackage) => p.popular);
            setSelectedPackage(popular?.package_id || data.coinPackages[0].package_id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch packages:', err);
        setError('Failed to load packages');
      } finally {
        setConfigLoading(false);
      }
    };

    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Please select a package');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'coins',
          packageId: selectedPackage,
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
      console.error('[CoinPurchaseModal] Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header with Close Button */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-black" />
              </div>
              <span className="text-3xl font-bold text-white">{currentBalance}</span>
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
              No packages available
            </div>
          ) : (
            <>
              {/* Pricing Grid */}
              <div className="space-y-4 mb-6">
                {/* First package - full width */}
                {packages.slice(0, 1).map((pkg) => (
                  <div
                    key={pkg.package_id}
                    onClick={() => setSelectedPackage(pkg.package_id)}
                    className={`relative bg-gray-800 rounded-xl p-4 border-2 transition cursor-pointer hover:shadow-xl ${
                      selectedPackage === pkg.package_id
                        ? 'border-yellow-500 shadow-lg'
                        : 'border-gray-700'
                    } ${pkg.popular ? 'ring-2 ring-yellow-500/30' : ''}`}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Best Value
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Left: Coins */}
                      <div className="flex items-center flex-1">
                        <div className="flex items-center">
                          <span className={`text-3xl font-bold mr-2 ${
                            selectedPackage === pkg.package_id ? 'text-yellow-500' : 'text-white'
                          }`}>
                            {pkg.coins.toLocaleString()}
                          </span>
                          <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center ${
                            selectedPackage === pkg.package_id ? 'bg-yellow-500' : 'bg-gray-600'
                          }`}>
                            <Coins className={`w-3 h-3 ${
                              selectedPackage === pkg.package_id ? 'text-black' : 'text-gray-400'
                            }`} />
                          </span>
                        </div>
                        {pkg.bonus_coins > 0 && (
                          <span className="text-yellow-500 text-xs ml-3">
                            +{pkg.bonus_coins.toLocaleString()} Coins
                          </span>
                        )}
                      </div>

                      {/* Right: Price */}
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">
                          ${pkg.price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Rest packages - 2 columns */}
                <div className="grid grid-cols-2 gap-4">
                  {packages.slice(1).map((pkg) => (
                    <div
                      key={pkg.package_id}
                      onClick={() => setSelectedPackage(pkg.package_id)}
                      className={`relative bg-gray-800 rounded-xl p-4 border-2 transition cursor-pointer hover:shadow-xl ${
                        selectedPackage === pkg.package_id
                          ? 'border-yellow-500 shadow-lg'
                          : 'border-gray-700'
                      } ${pkg.popular ? 'ring-2 ring-yellow-500/30' : ''}`}
                    >
                      {/* Popular Badge */}
                      {pkg.popular && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          Popular
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Left: Coins */}
                        <div className="flex items-center flex-1">
                          <div className="flex items-center">
                            <span className={`text-xl font-bold mr-1 ${
                              selectedPackage === pkg.package_id ? 'text-yellow-500' : 'text-white'
                            }`}>
                              {pkg.coins.toLocaleString()}
                            </span>
                            <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center ${
                              selectedPackage === pkg.package_id ? 'bg-yellow-500' : 'bg-gray-600'
                            }`}>
                              <Coins className={`w-2.5 h-2.5 ${
                                selectedPackage === pkg.package_id ? 'text-black' : 'text-gray-400'
                              }`} />
                            </span>
                          </div>
                          {pkg.bonus_coins > 0 && (
                            <span className="text-yellow-500 text-xs ml-2">
                              +{pkg.bonus_coins.toLocaleString()} Coins
                            </span>
                          )}
                        </div>

                        {/* Right: Price */}
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">
                            ${pkg.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={loading || configLoading || !selectedPackage}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-xl rounded-xl hover:from-red-600 hover:to-red-800 transition transform hover:scale-[1.01] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Processing...' : configLoading ? 'Loading...' : 'Buy Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
