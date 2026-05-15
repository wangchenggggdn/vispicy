'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Download, Loader2, Upload, Coins } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import InsufficientCoinsModal from '@/components/InsufficientCoinsModal';
import { FACE_SWAP_PRICE } from '@/lib/pricing';
import { triggerCoinsUpdate, useCoins } from '@/hooks/use-coins';

export const dynamic = 'force-dynamic';

interface GenerationResult {
  url: string;
  taskId: string;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/face-swap/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.url;
}

function UploadSlot({
  label,
  hint,
  preview,
  disabled,
  onSelect,
  onClear,
}: {
  label: string;
  hint: string;
  preview: string | null;
  disabled: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label} *</label>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-rose-400 transition">
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="max-h-48 mx-auto rounded" />
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className={`cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm">Click to upload image</p>
            <input
              type="file"
              accept="image/*"
              onChange={onSelect}
              className="hidden"
              disabled={disabled}
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default function FaceSwapPage() {
  const { data: session } = useSession();
  const { coins } = useCoins(30);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'target' | 'face'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (type === 'target') {
        setTargetFile(file);
        setTargetPreview(preview);
      } else {
        setFaceFile(file);
        setFacePreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (type: 'target' | 'face') => {
    if (type === 'target') {
      setTargetFile(null);
      setTargetPreview(null);
    } else {
      setFaceFile(null);
      setFacePreview(null);
    }
  };

  const pollForResult = async (id: string) => {
    try {
      for (let i = 0; i < 120; i++) {
        const response = await fetch(`/api/face-swap/result?taskId=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch result');
        }

        if (data.status === 2 && data.result?.url) {
          setResult({ url: data.result.url, taskId: id });
          setTaskId(null);
          return;
        }

        if (data.status === 3) {
          throw new Error(data.error || 'Face swap failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setError('Processing timeout. Please check your history later.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch result');
    } finally {
      setTaskId(null);
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!targetFile || !faceFile) {
      setError('Please upload both target image and face source image');
      return;
    }

    if (coins !== null && coins < FACE_SWAP_PRICE) {
      setShowInsufficientCoinsModal(true);
      return;
    }

    setLoading(true);
    setUploading(true);
    setError('');
    setResult(null);
    setTaskId(null);

    try {
      const [imageUrl, sourceUrl] = await Promise.all([
        uploadImage(targetFile),
        uploadImage(faceFile),
      ]);

      setUploading(false);

      const response = await fetch('/api/face-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, sourceUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setShowInsufficientCoinsModal(true);
          return;
        }
        throw new Error(data.error || 'Face swap failed');
      }

      if (data.taskId) {
        setTaskId(data.taskId);
        triggerCoinsUpdate();
        await pollForResult(data.taskId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face swap failed, please try again');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.url) return;

    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `vispicy-face-swap-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const isProcessing = loading || !!taskId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Users className="w-8 h-8 mr-3 text-rose-600" />
            Face Swap
          </h1>
          <p className="text-gray-600">
            Upload a target photo and a face source photo. AI will swap the face onto your image.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
            <UploadSlot
              label="Target Image"
              hint="The photo to put the new face on (body / scene)"
              preview={targetPreview}
              disabled={isProcessing}
              onSelect={(e) => handleFileSelect(e, 'target')}
              onClear={() => clearImage('target')}
            />

            <UploadSlot
              label="Face Source"
              hint="The face you want to use (portrait / headshot)"
              preview={facePreview}
              disabled={isProcessing}
              onSelect={(e) => handleFileSelect(e, 'face')}
              onClear={() => clearImage('face')}
            />

            <div className="flex items-center justify-between text-sm text-gray-600 bg-rose-50 rounded-lg px-4 py-3">
              <span>Cost per generation</span>
              <span className="font-semibold text-rose-700 flex items-center">
                {FACE_SWAP_PRICE}
                <Coins className="w-4 h-4 ml-1" />
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !targetFile || !faceFile}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-lg font-medium hover:from-rose-700 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading images...
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Swapping face...
                </>
              ) : (
                'Start Face Swap'
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Result</h2>

            {result?.url ? (
              <div className="space-y-4">
                <div
                  className="relative cursor-pointer rounded-lg overflow-hidden border"
                  onClick={() => setViewingImage(result.url)}
                >
                  <img
                    src={result.url}
                    alt="Face swap result"
                    className="w-full h-auto max-h-[480px] object-contain bg-gray-50"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-2 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
                <p>{uploading ? 'Uploading your photos...' : 'AI is swapping the face...'}</p>
                {taskId && (
                  <p className="text-xs text-gray-400 mt-2">Task ID: {taskId}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="w-16 h-16 mb-4 opacity-40" />
                <p>Your result will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <InsufficientCoinsModal
        isOpen={showInsufficientCoinsModal}
        onClose={() => setShowInsufficientCoinsModal(false)}
        requiredCoins={FACE_SWAP_PRICE}
        currentCoins={coins ?? 0}
      />
    </div>
  );
}
