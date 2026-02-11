'use client';

import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';

interface InsufficientCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCoins: number;
  currentCoins: number;
}

export default function InsufficientCoinsModal({
  isOpen,
  onClose,
  requiredCoins,
  currentCoins,
}: InsufficientCoinsModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleBuyCoins = () => {
    onClose();
    router.push('/coins');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fade-in">
        {/* 金币图标 */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Coins className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Insufficient Coins</h2>

        {/* 说明文字 */}
        <p className="text-gray-600 mb-6">
          You need <span className="font-bold text-orange-600">{requiredCoins}</span> coins for this generation,
          but you only have <span className="font-bold text-yellow-600">{currentCoins}</span> coins.
        </p>

        {/* 按钮组 */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            OK
          </button>
          <button
            onClick={handleBuyCoins}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition shadow-lg"
          >
            Buy Coins
          </button>
        </div>
      </div>
    </div>
  );
}
