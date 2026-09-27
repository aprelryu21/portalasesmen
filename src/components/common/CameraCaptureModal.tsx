import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
  aspectRatio?: number; // default 3:4 for portrait passphoto
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Ambil Foto Langsung',
  aspectRatio = 3 / 4,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera tracks cleanly
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    setIsInitializing(true);
    setErrorMessage(null);
    try {
      // Stop old tracks first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Perangkat atau browser tidak mendukung fitur akses kamera.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses.';
      setErrorMessage(
        msg.includes('Permission') || msg.includes('denied')
          ? 'Izin kamera belum diberikan pada browser. Pastikan perizinan kamera diizinkan di pengaturan browser Anda.'
          : 'Gagal menghubungkan ke kamera: ' + msg
      );
    } finally {
      setIsInitializing(false);
    }
  }, [stream]);

  // Effect to initialize camera when opened
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      void startCamera(facingMode);
    } else {
      stopTracks();
    }
    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flip facing mode
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture frame
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;

    // Calculate crop for desired aspect ratio (e.g. 3:4 portrait)
    let cropW = videoW;
    let cropH = cropW / aspectRatio;

    if (cropH > videoH) {
      cropH = videoH;
      cropW = cropH * aspectRatio;
    }

    const startX = (videoW - cropW) / 2;
    const startY = (videoH - cropH) / 2;

    canvas.width = 480;
    canvas.height = Math.round(480 / aspectRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopTracks();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    void startCamera(facingMode);
  };

  const handleConfirmUse = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopTracks();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-lg w-full overflow-hidden p-5 flex flex-col space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Camera className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900">{title}</h3>
              <p className="text-[11px] text-neutral-500">Posisikan wajah tepat di dalam bingkai pasfoto.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Screen */}
        <div className="relative w-full aspect-[4/3] bg-neutral-900 border-2 border-black rounded-xl overflow-hidden flex items-center justify-center">
          {errorMessage ? (
            <div className="p-4 text-center text-white max-w-xs space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void startCamera(facingMode)}
                className="px-3 py-1.5 bg-yellow-400 text-black font-black text-xs border border-black rounded-lg shadow-[2px_2px_0px_#000]"
              >
                Coba Lagi
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Hasil Jepretan"
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    void videoRef.current.play();
                  }
                }}
              />

              {/* Viewfinder Portrait Guide Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[58%] aspect-[3/4] border-2 border-dashed border-yellow-300 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative">
                  {/* Head oval guide */}
                  <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[60%] h-[48%] border border-yellow-300/60 rounded-full" />
                  {/* Cross guide lines */}
                  <div className="absolute top-[36%] left-0 right-0 border-t border-yellow-300/30" />
                  <div className="absolute top-0 bottom-0 left-1/2 border-l border-yellow-300/30" />
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                  Mengaktifkan Kamera...
                </div>
              )}
            </>
          )}
        </div>

        {/* Hidden canvas for snapshotting */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Control Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Foto Ulang
              </button>

              <button
                type="button"
                onClick={handleConfirmUse}
                className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 border-2 border-black rounded-lg text-xs font-black uppercase text-black flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Gunakan Foto Ini
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer"
                title="Beralih Kamera Depan / Belakang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Beralih Kamera</span>
              </button>

              <button
                type="button"
                disabled={isInitializing || !!errorMessage}
                onClick={takeSnapshot}
                className="px-6 py-2.5 bg-yellow-300 hover:bg-yellow-200 disabled:opacity-50 border-2 border-black rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <Camera className="w-4 h-4 text-black" />
                Jepret Foto
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
