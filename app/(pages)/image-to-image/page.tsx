'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { ImageIcon, Download, Loader2, Upload, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import ModelParamsForm from '@/components/ModelParamsForm';
import LoginModal from '@/components/LoginModal';
import { AIModel } from '@/types';
import { calculatePrice } from '@/lib/pricing';
import { triggerCoinsUpdate } from '@/hooks/use-coins';
import { uploadToLitterbox } from '@/lib/litterbox';
import { useDiscountedPrice } from '@/hooks/use-discounted-price';

interface GenerationResult {
  urls: string[];
  taskId: string;
}

export const dynamic = 'force-dynamic';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ImageToImagePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { calculateDiscountedPrice } = useDiscountedPrice();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelParams, setModelParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 获取图生图模型列表
  const { data: models } = useSWR<AIModel[]>('/api/models?type=image2image', fetcher);

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
          // 优先使用定义的 default 值
          if (param.default !== undefined) {
            defaults[param.name] = param.default;
          }
          // 对于必填参数且没有 default 的情况，从 enum 中选择第一个值
          else if (param.required && param.enum && param.enum.length > 0) {
            defaults[param.name] = param.enum[0];
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

    const originalPrice = calculatePrice('image2image', selectedModel, modelParams);
    const discountedPrice = calculateDiscountedPrice(originalPrice, 'image');

    console.log('[Image-to-Image] Original price:', originalPrice);
    console.log('[Image-to-Image] Discounted price:', discountedPrice);

    return discountedPrice;
  }, [selectedModel, modelParams, calculateDiscountedPrice]);

  // 轮询获取结果
  const pollForResult = async (id: string) => {
    try {
      // 图片生成：立即开始，每1秒查询一次
      for (let i = 0; i < 180; i++) {
        const response = await fetch(`/api/generate/image-to-image/result?jobId=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '查询结果失败');
        }

        // 状态：1=正在创作, 2=成功, 3=失败
        if (data.status === 2 && data.result) {
          // 任务成功，显示结果
          let urls: string[] = [];

          // 支持多种返回格式
          if (data.result.images && Array.isArray(data.result.images)) {
            // [{url: ...}, {url: ...}]
            urls = data.result.images.map((img: any) => img.url).filter(Boolean);
          } else if (Array.isArray(data.result)) {
            // [url1, url2, ...]
            urls = data.result.filter((item: any) => typeof item === 'string' || item?.url);
            if (urls.length > 0 && urls[0]?.url) urls = urls.map((u: any) => u.url);
          } else if (data.result.url) {
            // {url: "..."}
            urls = [data.result.url];
          }

          if (urls.length > 0) {
            setResult({ urls, taskId: id });
          }
          setJobId(null);
          return;
        }

        if (data.status === 3) {
          throw new Error(data.error || '生成失败');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setError('生成超时，请稍后查看');
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取结果失败');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!prompt.trim() || !sourceImage) {
      setError('Please enter a prompt and upload a reference image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setJobId(null);

    try {
      // 上传图片到litterbox获取临时URL
      let imageUrl = sourceImagePreview;
      if (sourceImage) {
        try {
          imageUrl = await uploadToLitterbox(sourceImage);
        } catch (uploadError) {
          setError('图片上传失败，请重试');
          setLoading(false);
          return;
        }
      }

      const requestBody: any = {
        prompt,
        image: imageUrl,
        model: selectedModel,
      };

      // 添加动态参数
      Object.assign(requestBody, modelParams);

      const response = await fetch('/api/generate/image-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

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
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.urls || result.urls.length === 0) return;

    try {
      // 下载所有图片
      for (let i = 0; i < result.urls.length; i++) {
        const url = result.urls[i];
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `vicraft-img2img-${Date.now()}-${i + 1}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);

        // 添加延迟以避免浏览器阻止多次下载
        if (i < result.urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <ImageIcon className="w-8 h-8 mr-3 text-blue-600" />
            Image to Image
          </h1>
          <p className="text-gray-600">Upload a reference image with description, AI generates new creative works</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Model *</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium mb-2">Reference Image *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                  {sourceImagePreview ? (
                    <div className="relative">
                      <img
                        src={sourceImagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded"
                      />
                      <button
                        onClick={() => {
                          setSourceImage(null);
                          setSourceImagePreview(null);
                        }}
                        className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Click or drag to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prompt *</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the changes you want, e.g., Transform this image into an oil painting style..."
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                disabled={loading || !sourceImage}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    <span>Generate Image ({calculatedPrice === 0 ? 'Free' : (
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
                  Please<Link href="/api/auth/signin" className="text-blue-600 hover:underline">sign in</Link>to use this feature
                </p>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Generation Result</h2>

            {loading && (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Creating task...</p>
                </div>
              </div>
            )}

            {!loading && jobId && !result && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-2">✓ Task Created Successfully!</p>
                <p className="text-sm text-green-700">Task ID: <code className="bg-green-100 px-2 py-1 rounded">{jobId}</code></p>
                <p className="text-sm text-green-700 mt-2">AI is processing in the background, please wait...</p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                {/* 根据图片数量动态调整网格布局 */}
                <div className={`grid gap-4 ${
                  result.urls.length === 1 ? 'grid-cols-1' :
                  result.urls.length === 2 ? 'grid-cols-2' :
                  result.urls.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2'
                }`}>
                  {result.urls.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                      onClick={() => setViewingImage(url)}
                    >
                      <img
                        src={url}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Images ({result.urls.length})</span>
                </button>
              </div>
            )}

            {!loading && !result && (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an image and enter a prompt, then click generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图片放大模态框 */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={viewingImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
