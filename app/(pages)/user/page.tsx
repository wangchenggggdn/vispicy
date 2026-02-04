'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { User, Coins, History, Calendar, CreditCard, ImageIcon, Video, ExternalLink, X, Download } from 'lucide-react';
import { formatDate, getSubscriptionLabel, getSubscriptionStatus } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import SubscriptionModal from '@/components/SubscriptionModal';
import CoinPurchaseModal from '@/components/CoinPurchaseModal';
import { useCoins } from '@/hooks/use-coins';
import { useSubscription } from '@/hooks/use-subscription';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const dynamic = 'force-dynamic';

export default function UserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pollingJobsRef = useRef<Set<string>>(new Set());
  const [shouldPoll, setShouldPoll] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCoinPurchaseModal, setShowCoinPurchaseModal] = useState(false);
  const { coins } = useCoins(30); // 30秒刷新一次，更频繁以实时显示
  const {
    rights_type,
    subscription_type,
    subscription_expires_at,
    isActive: hasActiveSubscription
  } = useSubscription(30); // 30秒刷新一次Subscription Status

  const { data: orders } = useSWR(
    session?.user ? '/api/orders' : null,
    fetcher
  );

  const { data: historyData, isLoading: historyLoading, mutate: mutateHistory } = useSWR(
    session?.user ? '/api/user/history' : null,
    fetcher,
    {
      refreshInterval: shouldPoll ? 5000 : 0, // 每5秒刷新一次
    }
  );

  // 轮询进行中的任务
  useEffect(() => {
    if (!historyData?.history) return;

    const pendingJobs = historyData.history.filter((item: any) => item.status === 1);

    // 如果有进行中的任务，启用轮询
    if (pendingJobs.length > 0) {
      setShouldPoll(true);
      console.log(`[User Page] Found ${pendingJobs.length} pending jobs, polling...`);

      const pollJobs = async () => {
        for (const job of pendingJobs) {
          const jobId = job.job_id;

          // 如果正在轮询这个任务，跳过
          if (pollingJobsRef.current.has(jobId)) {
            continue;
          }

          // 标记为正在轮询
          pollingJobsRef.current.add(jobId);

          try {
            // 确定API路径
            const apiPaths: Record<string, string> = {
              text2image: '/api/generate/text-to-image/result',
              image2image: '/api/generate/image-to-image/result',
              text2video: '/api/generate/text-to-video/result',
              image2video: '/api/generate/image-to-video/result',
            };

            const apiPath = apiPaths[job.task_type];
            if (!apiPath) continue;

            const response = await fetch(`${apiPath}?jobId=${jobId}`);
            if (response.ok) {
              const data = await response.json();

              // 如果任务完成（成功或失败），刷新数据
              if (data.status === 2 || data.status === 3) {
                console.log(`[User Page] Job ${jobId} completed with status ${data.status}`);
                mutateHistory(); // 刷新Generation History
                pollingJobsRef.current.delete(jobId);
                // 触发金币更新事件（因为创作消耗了金币）
                console.log('[User Page] Triggering coins-update event after job completion');
                window.dispatchEvent(new CustomEvent('coins-update'));
              }
            }
          } catch (error) {
            console.error(`[User Page] Error polling job ${jobId}:`, error);
            pollingJobsRef.current.delete(jobId);
          }
        }
      };

      pollJobs();
    } else {
      // 没有进行中的任务，停止轮询
      setShouldPoll(false);
      pollingJobsRef.current.clear();
    }
  }, [historyData, mutateHistory]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      pollingJobsRef.current.clear();
      setShouldPoll(false);
    };
  }, []);

  // 监听打开订阅弹窗事件
  useEffect(() => {
    const handleOpenSubscriptionModal = () => {
      setShowSubscriptionModal(true);
    };

    window.addEventListener('open-subscription-modal', handleOpenSubscriptionModal);

    return () => {
      window.removeEventListener('open-subscription-modal', handleOpenSubscriptionModal);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in first</p>
          <Link
            href="/"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{session.user.name || 'User'}</h1>
                <p className="text-gray-600">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Coin Balance</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {coins || 0}
                  </p>
                </div>
                <Coins className="w-10 h-10 text-yellow-600" />
              </div>
              <button
                onClick={() => setShowCoinPurchaseModal(true)}
                className="mt-3 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
              >
                Buy Coins →
              </button>
            </div>

            <div className={`rounded-lg p-4 ${
              hasActiveSubscription
                ? 'bg-gradient-to-r from-purple-50 to-purple-100'
                : 'bg-gradient-to-r from-gray-50 to-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Subscription Status</p>
                  <p className="text-xl font-bold">
                    {hasActiveSubscription
                      ? `${subscription_type === 'year' ? 'Yearly' : 'Weekly'}(${getSubscriptionLabel(rights_type)})`
                      : 'No Subscription'}
                  </p>
                  {subscription_expires_at && hasActiveSubscription && (
                    <p className="text-xs text-gray-600 mt-1">
                      Valid until {formatDate(subscription_expires_at)}
                    </p>
                  )}
                </div>
                <CreditCard className={`w-10 h-10 ${
                  hasActiveSubscription ? 'text-purple-600' : 'text-gray-400'
                }`} />
              </div>
              {!hasActiveSubscription && (
                <button
                  onClick={() => {
                    console.log('Opening subscription modal');
                    setShowSubscriptionModal(true);
                  }}
                  className="mt-3 text-sm text-purple-700 hover:text-purple-800 font-medium"
                >
                  View Plans →
                </button>
              )}
              {hasActiveSubscription && (
                <button
                  onClick={() => {
                    console.log('Opening subscription modal for upgrade');
                    setShowSubscriptionModal(true);
                  }}
                  className="mt-3 text-sm text-purple-700 hover:text-purple-800 font-medium"
                >
                  Upgrade →
                </button>
              )}
            </div>

            <Link href="/orders" className="block">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Order History</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {orders?.length || 0}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">orders</p>
                  </div>
                  <CreditCard className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Generation History Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <History className="w-6 h-6 mr-2 text-purple-600" />
            Generation History
          </h2>

          {historyLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : historyData?.history && historyData.history.length > 0 ? (
            <div className="space-y-4">
              {historyData.history.map((item: any) => {
                const taskTypeMap: Record<string, { label: string; icon: any; color: string }> = {
                  text2image: { label: 'Text to Image', icon: ImageIcon, color: 'text-purple-600' },
                  image2image: { label: 'Image to Image', icon: ImageIcon, color: 'text-blue-600' },
                  text2video: { label: 'Text to Video', icon: Video, color: 'text-indigo-600' },
                  image2video: { label: 'Image to Video', icon: Video, color: 'text-pink-600' },
                };

                const taskType = taskTypeMap[item.task_type] || taskTypeMap.text2image;
                const Icon = taskType.icon;

                const statusMap: Record<number, { label: string; bgColor: string; textColor: string }> = {
                  1: { label: 'Processing', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
                  2: { label: 'Success', bgColor: 'bg-green-100', textColor: 'text-green-800' },
                  3: { label: 'Failed', bgColor: 'bg-red-100', textColor: 'text-red-800' },
                };

                const status = statusMap[item.status] || statusMap[1];

                // 获取模型名称（去掉shortapi前缀）
                const modelName = item.model.split('/').pop() || item.model;

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${taskType.color}`} />
                        <div>
                          <div className="font-medium">{taskType.label}</div>
                          <div className="text-xs text-gray-500">{modelName}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>

                    {item.prompt && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">{item.prompt}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                          <span className="font-medium text-yellow-600">{item.price}</span> Coins
                        </span>
                        <span className="text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRecord(item);
                          setShowDetailModal(true);
                        }}
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No Generation History</p>
            </div>
          )}
        </div>
      </div>

      {/* 详情模态框 */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 头部 */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Generation Details</h2>
                <p className="text-sm text-gray-500 mt-1">Task ID: {selectedRecord.job_id}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRecord(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Task Type:</span>
                  <span className="ml-2 font-medium">
                    {selectedRecord.task_type === 'text2image' ? 'Text to Image' :
                     selectedRecord.task_type === 'image2image' ? 'Image to Image' :
                     selectedRecord.task_type === 'text2video' ? 'Text to Video' :
                     selectedRecord.task_type === 'image2video' ? 'Image to Video' : selectedRecord.task_type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Model:</span>
                  <span className="ml-2 font-medium">{selectedRecord.model.split('/').pop()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${
                    selectedRecord.status === 1 ? 'text-yellow-600' :
                    selectedRecord.status === 2 ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {selectedRecord.status === 1 ? 'Processing' :
                     selectedRecord.status === 2 ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2">{formatDate(selectedRecord.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Coins Used:</span>
                  <span className="ml-2 font-medium text-yellow-600">{selectedRecord.price}</span>
                </div>
              </div>

              {/* Prompt */}
              {selectedRecord.prompt && (
                <div>
                  <h3 className="font-medium mb-2">Prompt:</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRecord.prompt}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {selectedRecord.status === 3 && selectedRecord.error_message && (
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Error Message:</h3>
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                    {selectedRecord.error_message}
                  </p>
                </div>
              )}

              {/* 生成结果 */}
              {selectedRecord.status === 2 && selectedRecord.result && (
                <div>
                  <h3 className="font-medium mb-3">Generation Result:</h3>
                  <ResultDisplay result={selectedRecord.result} taskType={selectedRecord.task_type} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={(planId, billingCycle) => {
          console.log('Subscribed to:', planId, billingCycle);
          // TODO: 实现支付流程
          alert(`Subscribe: ${planId} - ${billingCycle}`);
        }}
      />

      {/* Coin Purchase Modal */}
      <CoinPurchaseModal
        isOpen={showCoinPurchaseModal}
        onClose={() => setShowCoinPurchaseModal(false)}
        onPurchase={(packageId) => {
          console.log('Purchased package:', packageId);
          // TODO: 实现支付流程
          alert(`Purchase: ${packageId}`);
        }}
        currentBalance={coins || 0}
      />
    </div>
  );
}

// 结果显示组件
function ResultDisplay({ result, taskType }: { result: any; taskType: string }) {
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // 解析结果URL
  const getUrls = (): string[] => {
    if (!result) return [];

    // 支持多种格式
    if (result.images && Array.isArray(result.images)) {
      return result.images.map((img: any) => img.url).filter(Boolean);
    }
    if (Array.isArray(result)) {
      const urls = result.filter((item: any) => typeof item === 'string' || item?.url);
      if (urls.length > 0 && urls[0]?.url) return urls.map((u: any) => u.url);
      return urls;
    }
    if (result.url) return [result.url];
    if (result.video) return [result.video];
    if (result.videos && Array.isArray(result.videos) && result.videos[0]?.url) {
      return [result.videos[0].url];
    }

    return [];
  };

  const urls = getUrls();
  const isVideo = taskType.includes('video');

  // 下载函数
  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `vicraft-${Date.now()}-${index + 1}${isVideo ? '.mp4' : '.png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (urls.length === 0) {
    return <p className="text-sm text-gray-500">No results</p>;
  }

  return (
    <div className="space-y-4">
      {/* 视频 */}
      {isVideo ? (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video src={urls[0]} controls className="w-full h-full" />
        </div>
      ) : (
        /* 图片网格 */
        <div className={`grid gap-4 ${
          urls.length === 1 ? 'grid-cols-1' :
          urls.length === 2 ? 'grid-cols-2' :
          urls.length === 3 ? 'grid-cols-3' :
          'grid-cols-2'
        }`}>
          {urls.map((url, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition relative group"
              onClick={() => setViewingImage(url)}
            >
              <img
                src={url}
                alt={`Generated result ${index + 1}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 下载按钮 */}
      <button
        onClick={() => handleDownload(urls[0], 0)}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
      >
        <Download className="w-5 h-5" />
        <span>Download {isVideo ? 'Video' : `Images (${urls.length})`}</span>
      </button>

      {/* 图片放大查看 */}
      {viewingImage && !isVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingImage(null);
              }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={viewingImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
