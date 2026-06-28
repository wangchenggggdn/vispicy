'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Users, Download, Loader2, Upload, Coins, Trash2, CreditCard, X } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import InsufficientCoinsModal from '@/components/InsufficientCoinsModal';
import { FACE_SWAP_GUEST_PRICE_USD, FACE_SWAP_PRICE } from '@/lib/pricing';
import { triggerCoinsUpdate, useCoins } from '@/hooks/use-coins';

export const dynamic = 'force-dynamic';

const PENDING_SWAP_KEY = 'face_swap_pending';
const DEFAULT_FACE_SOURCE = '/img/head.png';

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

async function resolveImageUrl(file: File | null, defaultPath?: string): Promise<string> {
  if (file) {
    return uploadImage(file);
  }

  if (defaultPath) {
    const response = await fetch(defaultPath);
    if (!response.ok) {
      throw new Error('Failed to load default image');
    }
    const blob = await response.blob();
    const fileName = defaultPath.split('/').pop() || 'default.png';
    const defaultFile = new File([blob], fileName, { type: blob.type || 'image/png' });
    return uploadImage(defaultFile);
  }

  throw new Error('Image is required');
}

function UploadSlot({
  label,
  hint,
  preview,
  disabled,
  onSelect,
  onClear,
  defaultSrc,
  isDefault,
}: {
  label: string;
  hint: string;
  preview: string | null;
  disabled: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  defaultSrc?: string;
  isDefault?: boolean;
}) {
  const hasUserImage = !!preview && !isDefault;

  return (
    <div>
      <label className="block text-sm lg:text-base font-medium mb-0.5 lg:mb-1">{label} *</label>
      <p className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-1.5 lg:line-clamp-none line-clamp-1">{hint}</p>

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-2.5 lg:p-4 hover:border-rose-400 transition min-h-[92px] lg:min-h-[132px] flex items-center">
        {hasUserImage ? (
          <div className="relative w-full text-center">
            <img src={preview} alt={label} className="max-h-24 lg:max-h-36 mx-auto rounded" />
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="absolute top-0 right-0 p-1.5 lg:p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition disabled:opacity-50"
              aria-label="Reset to default image"
            >
              <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </button>
          </div>
        ) : isDefault && defaultSrc ? (
          <label className={`cursor-pointer flex w-full items-center gap-3 lg:gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="h-[72px] w-[58px] lg:h-[96px] lg:w-[78px] shrink-0 overflow-hidden rounded-lg bg-gray-50 ring-1 ring-gray-200">
              <img
                src={defaultSrc}
                alt={label}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-1 lg:gap-1.5 min-h-[72px] lg:min-h-[96px] border-l border-dashed border-gray-200 pl-3 lg:pl-4">
              <Upload className="w-7 h-7 lg:w-9 lg:h-9 text-gray-400" />
              <p className="text-gray-600 text-xs lg:text-sm">Click to upload image</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onSelect}
              className="hidden"
              disabled={disabled}
            />
          </label>
        ) : (
          <label className={`cursor-pointer flex flex-col items-center justify-center gap-1.5 lg:gap-2 w-full min-h-[72px] lg:min-h-[96px] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-7 h-7 lg:w-9 lg:h-9 text-gray-400" />
            <p className="text-gray-600 text-xs lg:text-sm">Click to upload image</p>
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
  const [facePreview, setFacePreview] = useState<string | null>(DEFAULT_FACE_SOURCE);
  const [faceIsDefault, setFaceIsDefault] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
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
        setFaceIsDefault(false);
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
      setFacePreview(DEFAULT_FACE_SOURCE);
      setFaceIsDefault(true);
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
          setShowResultModal(true);
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
    if (!targetFile) {
      setError('Please upload a target image');
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
    setShowResultModal(false);
    setTaskId(null);

    try {
      const [imageUrl, sourceUrl] = await Promise.all([
        uploadImage(targetFile),
        resolveImageUrl(faceFile, DEFAULT_FACE_SOURCE),
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
      setShowResultModal(false);

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
      if (!targetFile) {
        throw new Error('Please upload a target image before paying');
      }

      const [imageUrl, sourceUrl] = await Promise.all([
        uploadImage(targetFile),
        resolveImageUrl(faceFile, DEFAULT_FACE_SOURCE),
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
    <div className="container mx-auto px-4 py-3 lg:py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-3 lg:mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:gap-3 lg:gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center shrink-0">
              <Users className="w-7 h-7 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-rose-600" aria-hidden="true" />
              Free Face Swap
            </h1>
            <div className="hidden md:block min-w-0 text-sm text-gray-600 leading-tight">
              <p className="whitespace-nowrap overflow-hidden text-ellipsis">
                Free AI face swap online — upload target & face photos, get realistic results in seconds.
              </p>
              {!isLoggedIn && (
                <p className="text-rose-700 text-xs mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  Try once free, no sign-in · then ${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)} per swap
                </p>
              )}
            </div>
          </div>
        </header>

        {paymentMessage && (
          <div className="mb-3 lg:mb-5 p-2.5 lg:p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">{paymentMessage}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 lg:items-start">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm space-y-3 lg:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-5">
              <UploadSlot
                label="Target Image"
                hint="Photo to put the new face on (body / scene)"
                preview={targetPreview}
                disabled={isProcessing}
                onSelect={(e) => handleFileSelect(e, 'target')}
                onClear={() => clearImage('target')}
              />

              <UploadSlot
                label="Face Source"
                hint="Face you want to use (portrait / headshot)"
                preview={facePreview}
                disabled={isProcessing}
                onSelect={(e) => handleFileSelect(e, 'face')}
                onClear={() => clearImage('face')}
                defaultSrc={DEFAULT_FACE_SOURCE}
                isDefault={faceIsDefault}
              />
            </div>

            {error && (
              <div className="p-2.5 lg:p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 bg-rose-50 rounded-lg px-3 lg:px-4 py-2 lg:py-3">
              <span>Cost per generation</span>
              <span className="font-semibold text-rose-700 flex items-center">
                {isLoggedIn ? (
                  <>
                    {FACE_SWAP_PRICE}
                    <Coins className="w-3.5 h-3.5 lg:w-4 lg:h-4 ml-1" />
                  </>
                ) : (
                  costLabel
                )}
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !targetFile}
              className="w-full py-2.5 lg:py-3.5 text-sm lg:text-base bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-lg font-medium hover:from-rose-700 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                disabled={isProcessing || !targetFile}
                className="w-full py-2.5 lg:py-3 border border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm lg:text-base"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${FACE_SWAP_GUEST_PRICE_USD.toFixed(2)} with PayPal
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm lg:min-h-[420px]">
            <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-5">Face Swap Result</h2>

            {hasResult ? (
              <div className="space-y-3 lg:space-y-4">
                <div className="rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center p-2 lg:p-4 min-h-[160px] lg:min-h-[240px]">
                  <img
                    src={result!.displayUrl}
                    alt="Face swap result preview"
                    className="max-h-32 lg:max-h-52 w-auto object-contain rounded cursor-pointer"
                    referrerPolicy="no-referrer"
                    onClick={() => setShowResultModal(true)}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== result!.url) {
                        img.src = result!.url;
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowResultModal(true)}
                  className="w-full py-2 lg:py-2.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition text-sm lg:text-base font-medium"
                >
                  View Result
                </button>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center h-40 lg:h-56 text-gray-500">
                <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 animate-spin text-rose-500 mb-3" />
                <p className="text-sm lg:text-base">{uploading ? 'Uploading your photos...' : paymentLoading ? 'Processing payment...' : 'AI is swapping the face...'}</p>
                {taskId && (
                  <p className="text-xs lg:text-sm text-gray-400 mt-1">Task ID: {taskId}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 lg:h-56 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="w-12 h-12 lg:w-16 lg:h-16 mb-2 opacity-40" />
                <p className="text-sm lg:text-base">Your result will appear here</p>
              </div>
            )}
          </div>
        </div>

        <section
          className="mt-8 lg:mt-12 bg-white rounded-xl p-5 lg:p-8 shadow-sm border border-rose-50"
          aria-labelledby="face-swap-faq-heading"
        >
          <h2 id="face-swap-faq-heading" className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
            Free Face Swap FAQ
          </h2>
          <dl className="space-y-4 lg:space-y-5 text-sm lg:text-base text-gray-600">
            <div>
              <dt className="font-semibold text-gray-800">Is this face swap free?</dt>
              <dd className="mt-1">
                Yes — your first face swap is free with no sign up. Create a Vispicy account for coins, history, and access to more AI tools.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-800">What photos work best?</dt>
              <dd className="mt-1">
                Use clear, front-facing photos with good lighting. One image is the scene or body (target), the other is the face you want to swap in (source).
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-800">How fast is the AI face swap?</dt>
              <dd className="mt-1">
                Most swaps complete in seconds after upload. Results can be previewed and downloaded directly from this page.
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {showResultModal && result && (
        <div
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowResultModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Face Swap Result</h3>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1 flex items-center justify-center bg-gray-50">
              <img
                src={result.displayUrl}
                alt="Face swap result"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== result.url) {
                    img.src = result.url;
                  }
                }}
              />
            </div>

            <div className="px-5 py-4 border-t flex gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-lg font-medium hover:from-rose-700 hover:to-orange-700 transition flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
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
              disabled={paymentLoading || !targetFile}
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
