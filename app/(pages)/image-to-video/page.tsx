'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { VideoIcon, Download, Loader2, Upload, Coins, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import ModelParamsForm from '@/components/ModelParamsForm';
import LoginModal from '@/components/LoginModal';
import SmoothChiliLoading from '@/components/SmoothChiliLoading';
import { AIModel } from '@/types';
import { calculatePrice } from '@/lib/pricing';
import { triggerCoinsUpdate } from '@/hooks/use-coins';
import { uploadToLitterbox } from '@/lib/litterbox';
import { useDiscountedPrice } from '@/hooks/use-discounted-price';

export const dynamic = 'force-dynamic';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ImageToVideoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { calculateDiscountedPrice } = useDiscountedPrice();

  // Tab切换：单图模式 vs 多图模式
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelParams, setModelParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  // 单图模式
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);

  // 多图模式
  const [sourceImages, setSourceImages] = useState<File[]>([]);
  const [sourceImagePreviews, setSourceImagePreviews] = useState<string[]>([]);

  const [jobId, setJobId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 获取Image to Video模型列表（包括单图和多图）
  const { data: models } = useSWR<AIModel[]>('/api/models/image-to-video', fetcher);

  // 根据tab筛选模型
  const filteredModels = useMemo(() => {
    if (!models) return [];
    if (activeTab === 'single') {
      // 单图模式：显示除了reference-to-video以外的模型
      return models.filter(m => m.shortapi !== 'vidu/vidu-q2/reference-to-video');
    } else {
      // 多图模式：只显示reference-to-video模型
      return models.filter(m => m.shortapi === 'vidu/vidu-q2/reference-to-video');
    }
  }, [models, activeTab]);

  // 设置默认选中第一个模型
  useEffect(() => {
    if (filteredModels && filteredModels.length > 0) {
      // 只有当当前选中的模型不在当前过滤后的模型列表中时，才重置为第一个模型
      const currentModelInList = filteredModels.find(m => m.shortapi === selectedModel);
      if (!currentModelInList) {
        setSelectedModel(filteredModels[0].shortapi);
      }
    }
  }, [filteredModels, selectedModel]);

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

  // 解析模型参数（处理字符串或数组格式）
  const parsedParameters = useMemo(() => {
    if (!selectedModelData?.parameters) return [];
    if (typeof selectedModelData.parameters === 'string') {
      try {
        return JSON.parse(selectedModelData.parameters);
      } catch {
        return [];
      }
    }
    return selectedModelData.parameters;
  }, [selectedModelData]);

  // 获取最大图片数量限制
  const maxImagesCount = useMemo(() => {
    const imageCountParam = parsedParameters?.find((p: any) => p.name === 'imagecount' || p.name === 'image_count');
    return imageCountParam?.required || 7;
  }, [parsedParameters]);

  // 动态计算价格（应用折扣）
  const calculatedPrice = useMemo(() => {
    if (!selectedModel) return 0;

    // 根据模型确定任务类型
    const isMultiImageModel = selectedModel === 'vidu/vidu-q2/reference-to-video';
    const taskType = isMultiImageModel ? 'images2video' : 'image2video';

    const originalPrice = calculatePrice(taskType, selectedModel, modelParams);
    const discountedPrice = calculateDiscountedPrice(originalPrice, 'video');

    return discountedPrice;
  }, [selectedModel, modelParams, calculateDiscountedPrice]);

  // 轮询获取结果
  const pollForResult = async (id: string) => {
    const maxAttempts = 120; // 最多轮询2分钟
    let attempts = 0;

    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        setError('Generation timeout. Please try again.');
        return;
      }

      try {
        const response = await fetch(`/api/generate/image-to-video/result?jobId=${id}`);
        const data = await response.json();

        // status: 1=进行中, 2=成功, 3=失败
        if (data.status === 2 && data.result) {
          // 提取视频 URL
          const videoUrl = data.result.videos?.[0]?.url;
          if (videoUrl) {
            setResult(videoUrl);
          }
          // 刷新金币显示
          triggerCoinsUpdate();
        } else if (data.status === 3 || data.error) {
          setError(data.error || 'Generation failed');
        } else {
          // 继续轮询
          setTimeout(poll, 2000);
        }
      } catch (err) {
        console.error('[Image-to-Video] Poll error:', err);
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  // 处理单图上传
  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setSourceImagePreview(URL.createObjectURL(file));
    }
  };

  // 处理多图上传
  const handleMultiImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // 检查是否会超过最大数量
    if (sourceImages.length + files.length > maxImagesCount) {
      setError(`Can only add up to ${maxImagesCount} images total. Currently have ${sourceImages.length}.`);
      return;
    }

    // 追加新图片到现有图片数组
    const newImages = [...sourceImages, ...files];
    setSourceImages(newImages);
    const newPreviews = [...sourceImagePreviews, ...files.map(file => URL.createObjectURL(file))];
    setSourceImagePreviews(newPreviews);
    setError(''); // 清除错误信息
  };

  // 移除多图中的一张图片
  const removeMultiImage = (index: number) => {
    const newImages = sourceImages.filter((_, i) => i !== index);
    const newPreviews = sourceImagePreviews.filter((_, i) => i !== index);
    setSourceImages(newImages);
    setSourceImagePreviews(newPreviews);
  };

  const handleGenerate = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setError('');
    setResult(null);

    // 验证prompt
    if (!prompt || prompt.trim() === '') {
      setError('Please enter a prompt');
      return;
    }

    // 验证模型
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    // 验证图片
    if (activeTab === 'single' && !sourceImage) {
      setError('Please upload an image');
      return;
    }

    if (activeTab === 'multi' && sourceImages.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    // 验证多图数量不超过限制
    if (activeTab === 'multi') {
      if (sourceImages.length > maxImagesCount) {
        setError(`Maximum ${maxImagesCount} images allowed`);
        return;
      }
    }

    setLoading(true);
    setError('');
    setResult(null);
    setJobId(null);

    try {
      // 上传图片
      let imageUrl: string | string[];

      if (activeTab === 'single') {
        if (!sourceImage) throw new Error('No image selected');
        imageUrl = await uploadToLitterbox(sourceImage);
      } else {
        if (sourceImages.length === 0) throw new Error('No images selected');
        // 并发上传所有图片
        const uploadPromises = sourceImages.map(img => uploadToLitterbox(img));
        imageUrl = await Promise.all(uploadPromises);
      }

      // 调用API
      const response = await fetch('/api/generate/image-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          image: activeTab === 'single' ? imageUrl : undefined,
          images: activeTab === 'multi' ? imageUrl : undefined,
          ...modelParams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError(data.error || 'Insufficient coins');
        } else {
          setError(data.error || 'Generation failed');
        }
        return;
      }

      // 显示jobId并开始轮询结果
      if (data.jobId) {
        setJobId(data.jobId);

        // 触发金币更新
        triggerCoinsUpdate();

        pollForResult(data.jobId);
      } else {
        setError('Failed to create job');
      }
    } catch (err) {
      console.error('[Image-to-Video] Generate error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <VideoIcon className="w-8 h-8 mr-3 text-indigo-600" />
            Image to Video
          </h1>
          <p className="text-gray-600">Transform your images into dynamic videos with AI animation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* Tab切换 */}
            <div className="mb-6">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => {
                    setActiveTab('single');
                    setError('');
                    setResult(null);
                  }}
                  className={`flex-1 px-6 py-3 font-semibold rounded-md transition-all ${
                    activeTab === 'single'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  📷 Single Image
                </button>
                <button
                  onClick={() => {
                    setActiveTab('multi');
                    setError('');
                    setResult(null);
                  }}
                  className={`flex-1 px-6 py-3 font-semibold rounded-md transition-all ${
                    activeTab === 'multi'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  🖼️ Multi-Images
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Prompt *</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you want to animate the image..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Image Upload */}
              {activeTab === 'single' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Image *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
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
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSingleImageChange}
                          className="hidden"
                          id="single-image-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="single-image-upload"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer inline-block"
                        >
                          Select Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Images (Up to {maxImagesCount}) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition">
                    {sourceImagePreviews.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {sourceImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              onClick={() => removeMultiImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                              disabled={loading}
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                        {sourceImagePreviews.length < maxImagesCount && (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMultiImageChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={loading}
                              multiple
                            />
                            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-indigo-500 transition">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload multiple images</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMultiImageChange}
                          className="hidden"
                          id="multi-image-upload"
                          disabled={loading}
                          multiple
                        />
                        <label
                          htmlFor="multi-image-upload"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer inline-block"
                        >
                          Select Images
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Up to {maxImagesCount} images</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Model *</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading || !filteredModels}
                >
                  {filteredModels.map((model) => (
                    <option key={model.shortapi} value={model.shortapi}>
                      {model.title}
                    </option>
                  ))}
                </select>
                {selectedModelData?.description && (
                  <p className="text-xs text-gray-500 mt-1">{selectedModelData.description}</p>
                )}
              </div>

              {/* Dynamic Parameters */}
              {parsedParameters && parsedParameters.length > 0 && (
                <ModelParamsForm
                  parameters={parsedParameters}
                  values={modelParams}
                  onChange={setModelParams}
                  disabled={loading}
                />
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !session}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-5 h-5" />
                    <span>Generate Video ({calculatedPrice === 0 ? 'Free' : (
                      <>
                        {calculatedPrice}
                        <Coins className="w-4 h-4 inline ml-0.5" />
                      </>
                    )})</span>
                  </>
                )}
              </button>

              {!session && (
                <p className="text-center text-sm text-gray-600">
                  Please{' '}
                  <Link href="/api/auth/signin" className="text-indigo-600 hover:underline">
                    sign in
                  </Link>
                  {' '}to generate
                </p>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong>Video generation may take 1-3 minutes, please be patient. Detailed scene descriptions will yield better results.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Generation Result</h2>

            {loading && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-600">Creating task...</p>
                </div>
              </div>
            )}

            {!loading && jobId && !result && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-green-800 font-medium mb-2">✓ Task created successfully!</p>
                    <p className="text-sm text-green-700">Task ID: <code className="bg-green-100 px-2 py-1 rounded">{jobId}</code></p>
                    <p className="text-sm text-green-700 mt-2">AI is processing in the background, please wait...</p>
                  </div>
                  <div className="ml-4">
                    <SmoothChiliLoading size={80} showText={false} />
                  </div>
                </div>
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
                <a
                  href={result}
                  download
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Video</span>
                </a>
              </div>
            )}

            {!loading && !result && !jobId && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <VideoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an image and click generate</p>
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
