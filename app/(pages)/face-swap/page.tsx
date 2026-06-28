'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Users, Download, Loader2, Upload, Coins, Trash2, CreditCard, X } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import InsufficientCoinsModal from '@/components/InsufficientCoinsModal';
import { FACE_SWAP_GUEST_PRICE_USD, FACE_SWAP_PRICE } from '@/lib/pricing';
import { triggerCoinsUpdate, useCoins } from '@/hooks/use-coins';

export const dynamic = 'force-dynamic';

const PENDING_SWAP_KEY = 'face_swap_pending';

interface GenerationResult {
  url: string;
  displayUrl: string;
  taskId: string;
}

interface GuestStatus {
  mode: 'guest';
  trialUsed: boolean;
  hasPaidCredit: boolean;
  freeTrialAvailable: boolean;
  priceUsd: number;
}

function toDisplayUrl(remoteUrl: string): string {
  return `/api/face-swap/image?url=${encodeURIComponent(remoteUrl)}`;
}

function extractResultUrl(data: {
  status?: number;
  result?: { url?: string };
  resultUrl?: string;
}): string | null {
  return data.result?.url || data.resultUrl || null;
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
  exampleSrc,
  exampleAlt,
  exampleCaption,
}: {
  label: string;
  hint: string;
  preview: string | null;
  disabled: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  exampleSrc?: string;
  exampleAlt?: string;
  exampleCaption?: string;
}) {
  const showExample = exampleSrc && !preview;

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label} *</label>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>

      {showExample && (
        <div className="mb-3 flex gap-3 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/90 to-orange-50/50 p-3 shadow-sm">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg ring-2 ring-white shadow-md">
            <Image
              src={exampleSrc}
              alt={exampleAlt || 'Example'}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Example</p>
            <p className="mt-1 text-xs leading-snug text-gray-600">
              {exampleCaption ||
                'Clear front-facing portrait or headshot; good lighting gives better results.'}
            </p>
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-rose-400 transition">
        {preview ? (
          <div className="relative inline-block w-full">
            <img src={preview} alt={label} className="max-h-48 mx-auto rounded" />
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition disabled:opacity-50"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className={`cursor-pointer block ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
  const searchParams = useSearchParams();
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
  const [showGuestPaymentModal, setShowGuestPaymentModal] = useState(false);
  const [guestStatus, setGuestStatus] = useState<GuestStatus | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const paymentCaptureStarted = useRef(false);

  const refreshGuestStatus = useCallback(async () => {
    if (session?.user?.id) {
      setGuestStatus(null);
      return;
    }

    try {
      const response = await fetch('/api/face-swap/guest-status');
      if (response.ok) {
        const data = await response.json();
        if (data.mode === 'guest') {
          setGuestStatus(data);
        }
      }
    } catch (err) {
      console.error('[Face-Swap] Failed to fetch guest status:', err);
    }
  }, [session?.user?.id]);

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

  useEffect(() => {
    refreshGuestStatus();
  }, [refreshGuestStatus]);

  const pollForResult = async (id: string) => {
    try {
      for (let i = 0; i < 120; i++) {
        const response = await fetch(`/api/face-swap/result?taskId=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch result');
        }

        const remoteUrl = extractResultUrl(data);

        if (data.status === 2 && remoteUrl) {
          setResult({
            url: remoteUrl,
            displayUrl: toDisplayUrl(remoteUrl),
            taskId: id,
          });
          setLoading(false);
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
      setLoading(false);
      setTaskId(null);
    }
  };

  const runFaceSwap = useCallback(async (imageUrl: string, sourceUrl: string) => {
    const response = await fetch('/api/face-swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, sourceUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 402) {
        if (session?.user?.id) {
          setShowInsufficientCoinsModal(true);
        } else if (data.requiresPayment) {
          setShowGuestPaymentModal(true);
        }
        return null;
      }
      throw new Error(data.error || 'Face swap failed');
    }

    if (session?.user?.id) {
      triggerCoinsUpdate();
    } else {
      await refreshGuestStatus();
    }

    return data.taskId as string;
  }, [session?.user?.id, refreshGuestStatus]);

  const handleGenerate = async () => {
    if (!targetFile || !faceFile) {
      setError('Please upload both target image and face source image');
      return;
    }

    if (session?.user?.id && coins !== null && coins < FACE_SWAP_PRICE) {
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

      const newTaskId = await runFaceSwap(imageUrl, sourceUrl);
      if (!newTaskId) {
        return;
      }

      setTaskId(newTaskId);
      await pollForResult(newTaskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face swap failed, please try again');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const resumePendingSwap = useCallback(async () => {
    const raw = sessionStorage.getItem(PENDING_SWAP_KEY);
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as { imageUrl: string; sourceUrl: string };
      if (!pending.imageUrl || !pending.sourceUrl) return;

      setLoading(true);
      setError('');
      setResult(null);

      const newTaskId = await runFaceSwap(pending.imageUrl, pending.sourceUrl);
      sessionStorage.removeItem(PENDING_SWAP_KEY);

      if (!newTaskId) {
        return;
      }

      setTaskId(newTaskId);
      await pollForResult(newTaskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face swap failed, please try again');
    } finally {
      setLoading(false);
    }
  }, [runFaceSwap]);

  useEffect(() => {
    const paypalState = searchParams.get('paypal');
    const token = searchParams.get('token');

    if (paypalState === 'cancel') {
      setPaymentMessage('Payment cancelled.');
      window.history.replaceState({}, '', '/face-swap');
      return;
    }

    if (paypalState !== 'return' || !token || paymentCaptureStarted.current) {
      return;
    }

    paymentCaptureStarted.current = true;

    const capturePayment = async () => {
      setPaymentLoading(true);
      setPaymentMessage('Confirming your payment...');

      try {
        const response = await fetch('/api/face-swap/payment/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: token }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Payment processing failed');
        }

        await refreshGuestStatus();
        setPaymentMessage('Payment successful. Starting face swap...');
        window.history.replaceState({}, '', '/face-swap');
        await resumePendingSwap();
      } catch (err) {
        setPaymentMessage(err instanceof Error ? err.message : 'Payment processing failed');
        window.history.replaceState({}, '', '/face-swap');
      } finally {
        setPaymentLoading(false);
      }
    };

    capturePayment();
  }, [searchParams, refreshGuestStatus, resumePendingSwap]);

  const handleGuestPayment = async () => {
    setPaymentLoading(true);
    setError('');

    try {
      if (!targetFile || !faceFile) {
        throw new Error('Please upload both images before paying');
      }

      const [imageUrl, sourceUrl] = await Promise.all([
        uploadImage(targetFile),
        uploadImage(faceFile),
      ]);

      sessionStorage.setItem(PENDING_SWAP_KEY, JSON.stringify({ imageUrl, sourceUrl }));

      const response = await fetch('/api/face-swap/payment/create-order', {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed, please try again');
      setPaymentLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.url) return;

    try {
      const response = await fetch(toDisplayUrl(result.url));
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

  const isProcessing = loading || uploading || !!taskId || paymentLoading;
  const hasResult = !!result?.displayUrl;
  const isLoggedIn = !!session?.user?.id;

  const costLabel = isLoggedIn
    ? `${FACE_SWAP_PRICE} coins per generation`
    : guestStatus?.freeTrialAvailable
      ? 'Free trial · 1 use without login'
      : guestStatus?.hasPaidCredit
        ? 'Paid · ready for 1 face swap'
        : `$${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)} per generation`;

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
          {!isLoggedIn && (
            <p className="text-sm text-rose-700 mt-2">
              Try once for free without signing in. After that, each use costs ${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)}.
            </p>
          )}
        </div>

        {paymentMessage && (
          <div className="mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">{paymentMessage}</div>
        )}

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
              exampleSrc="/img/head.png"
              exampleAlt="Example face source: clear portrait headshot for face swap"
              exampleCaption="Upload a photo like this — front-facing face, even lighting, similar to a headshot."
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600 bg-rose-50 rounded-lg px-4 py-3">
              <span>Cost per generation</span>
              <span className="font-semibold text-rose-700 flex items-center">
                {isLoggedIn ? (
                  <>
                    {FACE_SWAP_PRICE}
                    <Coins className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  costLabel
                )}
              </span>
            </div>

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

            {!isLoggedIn && guestStatus?.trialUsed && !guestStatus.hasPaidCredit && (
              <button
                type="button"
                onClick={() => setShowGuestPaymentModal(true)}
                disabled={isProcessing || !targetFile || !faceFile}
                className="w-full py-2.5 border border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)} with PayPal
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm min-h-[320px]">
            <h2 className="text-lg font-semibold mb-4">Result</h2>

            {hasResult ? (
              <div className="space-y-4">
                <div
                  className="relative cursor-pointer rounded-lg overflow-hidden border bg-gray-50 min-h-[240px] flex items-center justify-center"
                  onClick={() => setViewingImage(result!.displayUrl)}
                >
                  <img
                    src={result!.displayUrl}
                    alt="Face swap result"
                    className="w-full h-auto max-h-[480px] object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== result!.url) {
                        img.src = result!.url;
                      }
                    }}
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
                <p>{uploading ? 'Uploading your photos...' : paymentLoading ? 'Processing payment...' : 'AI is swapping the face...'}</p>
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

      {showGuestPaymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Continue with PayPal</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your free trial is used. Pay ${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)} for one face swap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuestPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleGuestPayment}
              disabled={paymentLoading || !targetFile || !faceFile}
              className="w-full py-3 bg-[#0070ba] text-white rounded-lg font-medium hover:bg-[#005ea6] transition disabled:opacity-50 flex items-center justify-center"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to PayPal...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Or{' '}
              <button
                type="button"
                onClick={() => {
                  setShowGuestPaymentModal(false);
                  setShowLoginModal(true);
                }}
                className="text-rose-600 hover:underline"
              >
                sign in
              </button>{' '}
              to use coins instead.
            </p>
          </div>
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
