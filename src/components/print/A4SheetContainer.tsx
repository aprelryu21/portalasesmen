import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface A4SheetContainerProps {
  pageNumber?: number;
  totalPages?: number;
  totalCards?: number;
  orientation?: 'portrait' | 'landscape';
  children: React.ReactNode;
  className?: string;
  marginMm?: number;
}

export const A4SheetContainer: React.FC<A4SheetContainerProps> = ({
  pageNumber,
  totalPages,
  totalCards,
  orientation = 'portrait',
  children,
  className = '',
  marginMm = 8,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [autoFit, setAutoFit] = useState<boolean>(true);

  const isPortrait = orientation === 'portrait';
  const widthMm = isPortrait ? 210 : 297;
  const heightMm = isPortrait ? 297 : 210;

  // 1mm ~ 3.7795px at 96 DPI
  const pixelWidth = widthMm * 3.7795;
  const pixelHeight = heightMm * 3.7795;

  useEffect(() => {
    if (!autoFit) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
      // Allow padding around sheet
      const availableWidth = Math.max(300, parentWidth - 32);

      if (availableWidth < pixelWidth) {
        const computedScale = Math.min(1, Math.max(0.35, availableWidth / pixelWidth));
        setScale(Number(computedScale.toFixed(3)));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pixelWidth, autoFit]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center select-none ${className}`}
    >
      {/* Zoom and Scale Toolbar (Only on Screen, Hidden in Print) */}
      <div className="no-print w-full max-w-[210mm] flex items-center justify-between mb-2 px-2 text-xs">
        <div className="flex items-center gap-2">
          {pageNumber && totalPages && (
            <span className="font-mono font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded text-[11px] shadow-xs">
              Lembar A4 #{pageNumber} / {totalPages} {totalCards !== undefined ? `(${totalCards} Kartu)` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-black rounded-lg px-2 py-1 shadow-[2px_2px_0px_#000]">
          <button
            type="button"
            onClick={() => {
              setAutoFit(false);
              setScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
            }}
            className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
            title="Perkecil Tampilan"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono font-bold text-[11px] min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => {
              setAutoFit(false);
              setScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
            }}
            className="p-1 hover:bg-neutral-100 rounded text-neutral-700 cursor-pointer"
            title="Perbesar Tampilan"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoFit(true);
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
              autoFit ? 'bg-yellow-300 border-black' : 'border-neutral-300 hover:bg-neutral-100'
            }`}
            title="Sesuaikan dengan Lebar Layar"
          >
            <Maximize2 className="w-3 h-3 inline mr-1" />
            Fit
          </button>

          {scale !== 1 && (
            <button
              type="button"
              onClick={() => {
                setAutoFit(false);
                setScale(1);
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-600 cursor-pointer"
              title="Kembali ke Ukuran Asli 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scalable Viewport Box: height is computed so scaled content doesn't leave huge whitespace */}
      <div
        className="w-full flex justify-center overflow-visible"
        style={{
          height: scale === 1 ? undefined : `${pixelHeight * scale}px`,
        }}
      >
        <div
          className="a4-page relative bg-white border-2 border-black shadow-[6px_6px_0px_#000] print:border-none print:shadow-none print:m-0 print:p-0 transition-transform origin-top flex flex-col justify-start"
          style={{
            width: `${widthMm}mm`,
            minHeight: `${heightMm}mm`,
            padding: `${marginMm}mm`,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            transform: scale === 1 ? undefined : `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
