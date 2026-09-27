import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Smartphone,
  Eye,
  X,
} from 'lucide-react';

interface PinchZoomCardContainerProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  className?: string;
  cardTitle?: string;
  badgeLabel?: string;
  showHelperTip?: boolean;
}

export const PinchZoomCardContainer: React.FC<PinchZoomCardContainerProps> = ({
  children,
  minScale = 0.6,
  maxScale = 3.5,
  initialScale = 1.0,
  className = '',
  cardTitle = 'Pratinjau Kartu',
  badgeLabel,
  showHelperTip = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState<number>(initialScale);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tipDismissed, setTipDismissed] = useState<boolean>(false);

  // Gesture refs to prevent react state latency during 60fps touch gestures
  const touchStateRef = useRef<{
    initialDist: number;
    initialScale: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    isPinching: boolean;
    isPanning: boolean;
    lastTapTime: number;
  }>({
    initialDist: 0,
    initialScale: initialScale,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isPinching: false,
    isPanning: false,
    lastTapTime: 0,
  });

  // Clamp helper
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  // Handle zoom in / out with step
  const handleZoom = useCallback(
    (delta: number) => {
      setScale((prev) => {
        const next = clamp(Number((prev + delta).toFixed(2)), minScale, maxScale);
        if (next <= 1.0) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    },
    [minScale, maxScale]
  );

  // Reset to initial scale & center position
  const handleReset = useCallback(() => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  }, [initialScale]);

  // Double tap toggle between 1.0x and 2.2x zoom
  const handleDoubleTap = useCallback(
    (clientX: number, clientY: number) => {
      if (scale > 1.2) {
        setScale(1.0);
        setPosition({ x: 0, y: 0 });
      } else {
        const targetScale = 2.2;
        setScale(targetScale);
        // Center slightly towards touch if possible
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const offsetX = (rect.width / 2 - (clientX - rect.left)) * 0.8;
          const offsetY = (rect.height / 2 - (clientY - rect.top)) * 0.8;
          setPosition({ x: offsetX, y: offsetY });
        }
      }
    },
    [scale]
  );

  // Attach non-passive touch listeners to container to allow e.preventDefault()
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      const touches = e.touches;
      const state = touchStateRef.current;

      if (touches.length === 2) {
        // Two fingers: Pinch-to-zoom
        const dist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
        state.initialDist = dist;
        state.initialScale = scale;
        state.isPinching = true;
        state.isPanning = false;
        setIsInteracting(true);
      } else if (touches.length === 1) {
        // One finger: Check double-tap or Pan
        const now = Date.now();
        const touch = touches[0];

        if (now - state.lastTapTime < 320) {
          // Double-tap triggered!
          e.preventDefault();
          handleDoubleTap(touch.clientX, touch.clientY);
          state.lastTapTime = 0;
          return;
        }
        state.lastTapTime = now;

        state.startX = touch.clientX - position.x;
        state.startY = touch.clientY - position.y;
        state.lastX = touch.clientX;
        state.lastY = touch.clientY;
        state.isPinching = false;
        state.isPanning = scale > 1.05;
        if (state.isPanning) {
          setIsInteracting(true);
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const touches = e.touches;
      const state = touchStateRef.current;

      if (state.isPinching && touches.length === 2) {
        // Prevent screen scrolling when pinching the card
        if (e.cancelable) e.preventDefault();

        const dist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
        if (state.initialDist > 0) {
          const ratio = dist / state.initialDist;
          const newScale = clamp(
            Number((state.initialScale * ratio).toFixed(2)),
            minScale,
            maxScale
          );
          setScale(newScale);
        }
      } else if (state.isPanning && touches.length === 1 && scale > 1.05) {
        // Prevent screen scrolling when panning the zoomed card
        if (e.cancelable) e.preventDefault();

        const touch = touches[0];
        const newX = touch.clientX - state.startX;
        const newY = touch.clientY - state.startY;

        // Dynamic boundaries based on current scale
        const maxOffset = Math.max(120, (scale - 1) * 220);
        setPosition({
          x: clamp(newX, -maxOffset, maxOffset),
          y: clamp(newY, -maxOffset, maxOffset),
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const state = touchStateRef.current;
      if (e.touches.length < 2) {
        state.isPinching = false;
      }
      if (e.touches.length === 0) {
        state.isPanning = false;
        setIsInteracting(false);

        // Snap back if scaled below 1.0
        if (scale < 0.9) {
          setScale(1.0);
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });
    container.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [scale, position, minScale, maxScale, handleDoubleTap]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Zoom if user scrolls with mouse inside the card container or holds Ctrl
    if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      handleZoom(delta);
    }
  };

  // Mouse dragging when zoomed in
  const mouseStateRef = useRef<{ isDown: boolean; startX: number; startY: number }>({
    isDown: false,
    startX: 0,
    startY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1.05) return;
    mouseStateRef.current = {
      isDown: true,
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
    setIsInteracting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseStateRef.current.isDown || scale <= 1.05) return;
    const maxOffset = Math.max(120, (scale - 1) * 220);
    setPosition({
      x: clamp(e.clientX - mouseStateRef.current.startX, -maxOffset, maxOffset),
      y: clamp(e.clientY - mouseStateRef.current.startY, -maxOffset, maxOffset),
    });
  };

  const handleMouseUp = () => {
    mouseStateRef.current.isDown = false;
    setIsInteracting(false);
  };

  // Container view
  const zoomPercent = Math.round(scale * 100);

  return (
    <>
      <div
        className={`relative flex flex-col rounded-xl overflow-hidden select-none border-2 border-dashed border-neutral-300 bg-[#FDFBF7] ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-neutral-900/90 backdrop-blur-sm p-4' : className
        }`}
      >
        {/* Top Header / Status bar inside zoom container */}
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-100/90 border-b border-neutral-200 text-xs z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-black uppercase tracking-tight text-neutral-800 flex items-center gap-1.5 truncate">
              <Eye className="w-3.5 h-3.5 text-neutral-600" />
              <span>{cardTitle}</span>
            </span>
            {badgeLabel && (
              <span className="px-1.5 py-0.5 bg-yellow-300 text-black border border-black rounded text-[9.5px] font-black shrink-0">
                {badgeLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zoom Percentage Pill */}
            <span
              onClick={handleReset}
              className="px-2 py-0.5 bg-white border border-black rounded font-mono font-black text-[10px] text-neutral-800 shadow-[1px_1px_0px_#000] cursor-pointer hover:bg-yellow-100"
              title="Klik untuk reset zoom (100%)"
            >
              {zoomPercent}%
            </span>

            {/* Quick Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 bg-white hover:bg-neutral-200 border border-black rounded shadow-[1px_1px_0px_#000] text-neutral-700 cursor-pointer"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Inspeksi Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Pinch Gesture Helper Badge */}
        {showHelperTip && !tipDismissed && (
          <div className="no-print mx-2 mt-2 px-2.5 py-1.5 bg-yellow-100/90 border border-yellow-400 text-yellow-950 rounded-lg text-[10.5px] font-medium flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 min-w-0">
              <Smartphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">
                <strong>Tips Mobile:</strong> Cubit 2 jari (pinch) untuk zoom • Ketuk 2x untuk perbesar
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTipDismissed(true)}
              className="p-0.5 text-yellow-800 hover:text-black shrink-0 cursor-pointer"
              title="Tutup panduan"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Interactive Viewport Area */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative flex-1 min-h-[350px] sm:min-h-[380px] flex items-center justify-center p-3 overflow-hidden cursor-${
            scale > 1.05 ? 'grab active:cursor-grabbing' : 'default'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Card Wrapper with 2D transform */}
          <div
            ref={contentWrapperRef}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isInteracting ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)',
              willChange: 'transform',
            }}
            className="flex items-center justify-center transition-transform"
          >
            {children}
          </div>
        </div>

        {/* Floating Mobile HUD Controls Bar (Bottom) */}
        <div className="no-print p-2 bg-neutral-100/90 border-t border-neutral-200 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1">
            {/* Zoom Out Button */}
            <button
              type="button"
              onClick={() => handleZoom(-0.25)}
              disabled={scale <= minScale}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] text-black text-xs font-black flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perkecil</span>
            </button>

            {/* Reset / 100% Fit Button */}
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] text-black text-xs font-black flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
              title="Reset ke Ukuran Pas (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Pas</span>
            </button>

            {/* Zoom In Button */}
            <button
              type="button"
              onClick={() => handleZoom(0.25)}
              disabled={scale >= maxScale}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] text-black text-xs font-black flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-600">
            <span className="hidden sm:inline text-neutral-400">•</span>
            <button
              type="button"
              onClick={() => setScale(scale >= 2.0 ? 1.0 : 2.0)}
              className="px-2 py-1 bg-white hover:bg-neutral-100 border border-black rounded font-mono text-[10px] font-bold shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              {scale >= 2.0 ? '1.0×' : '2.0× Zoom'}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Backdrop Close Button if isFullscreen */}
      {isFullscreen && (
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black rounded-full shadow-[2px_2px_0px_#000] cursor-pointer"
          title="Tutup Mode Layar Penuh (ESC)"
        >
          <X className="w-5 h-5 font-black" />
        </button>
      )}
    </>
  );
};
