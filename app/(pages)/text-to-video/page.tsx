'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { VideoIcon, Download, Loader2, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import ModelParamsForm from '@/components/ModelParamsForm';
import LoginModal from '@/components/LoginModal';
import { AIModel } from '@/types';
import { calculatePrice } from '@/lib/pricing';
import { triggerCoinsUpdate } from '@/hooks/use-coins';
import { useDiscountedPrice } from '@/hooks/use-discounted-price';

export const dynamic = 'force-dynamic';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TextToVideoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { calculateDiscountedPrice } = useDiscountedPrice();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelParams, setModelParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 获取Text to Video模型列表
  const { data: models } = useSWR<AIModel[]>('/api/models?type=text2video', fetcher);

  // 设置默认选中第一个模型
  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].shortapi);
    }
  }, [models]);

  // 当模型改变时，重置参数并设置默认值
  useEffect(() => {
    if (selectedModel && models && Array.isArray(models)) {
      const model = models.find((m) => m.shortapi === selectedModel);
      if (model?.parameters) {
        // 处理 parameters 可能是字符串的情况
        const params = typeof model.parameters === 'string'
          ? JSON.parse(model.parameters)
          : model.parameters;
        const defaults: Record<string, any> = {};
        params.forEach((param: any) => {
          // 使用默认值，或者从枚举值中取第一个
          const value = param.default !== undefined
            ? param.default
            : param.enum?.[0] || null;
          if (value !== null) {
            defaults[param.name] = value;
          }
        });
        setModelParams(defaults);
      } else {
        setModelParams({});
      }
    }
  }, [selectedModel, models]);

  const selectedModelData = models?.find((m: AIModel) => m.shortapi === selectedModel);

  // 动态计算价格（应用折扣）
  const calculatedPrice = useMemo(() => {
    if (!selectedModel) return 0;

    const originalPrice = calculatePrice('text2video', selectedModel, modelParams);
    const discountedPrice = calculateDiscountedPrice(originalPrice, 'video');

    console.log('[Text-to-Video] Original price:', originalPrice);
    console.log('[Text-to-Video] Discounted price:', discountedPrice);

    return discountedPrice;
  }, [selectedModel, modelParams, calculateDiscountedPrice]);

  // 轮询获取结果
  const pollForResult = async (id: string) => {
    try {
      // 视频生成：等待2分钟后开始查询，之后每5秒查询一次
      await new Promise(resolve => setTimeout(resolve, 120000));

      for (let i = 0; i < 72; i++) {  // 最多6分钟 (72 * 5秒)
        const response = await fetch(`/api/generate/text-to-video/result?jobId=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '查询结果失败');
        }

        // 状态：1=正在创作, 2=成功, 3=失败
        if (data.status === 2 && data.result) {
          // 视频结果可能在 result.videos[0].url, result.url, 或 result.video
          const url = data.result.videos?.[0]?.url || data.result.url || data.result.video;
          if (url) {
            setResult(url);
          }
          setJobId(null);
          return;
        }

        if (data.status === 3) {
          throw new Error(data.error || '生成失败');
        }

        // 每5秒查询一次
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      setError('生成超时，请稍后查看');
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取结果失败');
    }
  };

  const handleGenerate = async () => {
    console.log('[Text-to-Video] handleGenerate called');
    console.log('[Text-to-Video] prompt:', prompt);
    console.log('[Text-to-Video] selectedModel:', selectedModel);
    console.log('[Text-to-Video] modelParams:', modelParams);

    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!selectedModel) {
      setError('请选择模型');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setJobId(null);

    try {
      const requestBody: any = {
        prompt,
        model: selectedModel,
      };

      // 添加动态参数
      Object.assign(requestBody, modelParams);

      console.log('[Text-to-Video] Sending request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/generate/text-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('[Text-to-Video] Response status:', response.status);

      const data = await response.json();
      console.log('[Text-to-Video] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      // 显示jobId并开始轮询结果
      if (data.jobId) {
        setJobId(data.jobId);

        // 触发金币更新
        triggerCoinsUpdate();

        pollForResult(data.jobId);
      }
    } catch (err) {
      console.error('[Text-to-Video] Error:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vicraft-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <VideoIcon className="w-8 h-8 mr-3 text-pink-600" />
            Text to Video
          </h1>
          <p className="text-gray-600">Describe scenes in words, AI generates vivid short video content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {/* 模型选择 */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Model *</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={loading || !models}
                >
                  {models && models.length > 0 ? (
                    models.map((model) => (
                      <option key={model.id} value={model.shortapi}>
                        {model.title}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading...</option>
                  )}
                </select>
                {selectedModelData?.description && (
                  <p className="text-xs text-gray-500 mt-1">{selectedModelData.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prompt *</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video scene you want to generate, e.g., A cute corgi swimming elegantly in a sunny pool, underwater view showing the dog's expression..."
                  className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>

              {/* 动态参数表单 */}
              {selectedModelData?.parameters && (
                <ModelParamsForm
                  parameters={selectedModelData.parameters}
                  values={modelParams}
                  onChange={setModelParams}
                  disabled={loading}
                />
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-5 h-5" />
                    <span>Generate Video ({calculatedPrice === 0 ? '免费' : (
                      <>
                        {calculatedPrice}
                        <Coins className="w-4 h-4 inline ml-0.5" />
                      </>
                    )})</span>
                  </>
                )}
              </button>

              {!session && (
                <p className="text-center text-sm text-gray-500">
                  请先<Link href="/api/auth/signin" className="text-pink-600 hover:underline">登录</Link>后使用
                </p>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong>Video generation may take 1-3 minutes, please be patient. Detailed scene descriptions will yield better results.
                </p>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Generation Result</h2>

            {loading && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
                  <p className="text-gray-600">正在创建任务...</p>
                </div>
              </div>
            )}

            {!loading && jobId && !result && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-2">✓ 任务创建成功！</p>
                <p className="text-sm text-green-700">任务ID: <code className="bg-green-100 px-2 py-1 rounded">{jobId}</code></p>
                <p className="text-sm text-green-700 mt-2">AI正在后台处理，请稍等...</p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={result}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Video</span>
                </button>
              </div>
            )}

            {!loading && !result && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <VideoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter a prompt and click generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
