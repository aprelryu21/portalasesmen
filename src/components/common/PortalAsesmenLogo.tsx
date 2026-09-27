import React from 'react';

interface PortalAsesmenLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon-only' | 'full' | 'compact';
  className?: string;
  theme?: 'dark' | 'light' | 'color';
}

export const PortalAsesmenLogo: React.FC<PortalAsesmenLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  // Size mapping for the 1:1 icon box
  const sizeMap = {
    xs: { box: 'w-7 h-7', text: 'text-xs', sub: 'text-[8px]', pSize: 'text-xs', aSize: 'text-[10px]' },
    sm: { box: 'w-9 h-9', text: 'text-sm', sub: 'text-[9px]', pSize: 'text-sm', aSize: 'text-xs' },
    md: { box: 'w-11 h-11', text: 'text-base', sub: 'text-[10px]', pSize: 'text-base', aSize: 'text-xs' },
    lg: { box: 'w-14 h-14', text: 'text-xl', sub: 'text-xs', pSize: 'text-xl', aSize: 'text-sm' },
    xl: { box: 'w-18 h-18', text: 'text-2xl', sub: 'text-xs', pSize: 'text-2xl', aSize: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // 1:1 Neobrutalist Emblem: Overlapping "P" and "A" badges with bold borders & hard drop shadow
  const Icon1to1 = (
    <div
      className={`relative ${currentSize.box} aspect-square flex-shrink-0 select-none ${className}`}
      title="PORTAL ASESMEN"
    >
      {/* Base container badge with Neobrutalist styling */}
      <div className="w-full h-full bg-[#FFE600] border-2 sm:border-[2.5px] border-black rounded-xl sm:rounded-2xl shadow-[2.5px_2.5px_0px_#000] overflow-hidden relative flex items-center justify-center p-1">
        {/* Subtle geometric background grid dots */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:6px_6px]" />

        {/* Diagonal color accent strip */}
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-sky-400 border border-black rotate-12 rounded-xs pointer-events-none" />

        {/* OVERLAPPING BOXES: 'P' and 'A' */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Box 1: Left / Top 'P' (Bold Black on White / Golden Accent) */}
          <div className="absolute top-[8%] left-[8%] w-[58%] h-[58%] bg-white border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center z-10">
            <span className="font-black text-black leading-none tracking-tighter" style={{ fontSize: '110%' }}>
              P
            </span>
          </div>

          {/* Box 2: Right / Bottom 'A' (Overlapping in Royal Blue / Cyan with White Letter) */}
          <div className="absolute bottom-[8%] right-[8%] w-[58%] h-[58%] bg-[#2563EB] border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center z-20">
            <span className="font-black text-white leading-none tracking-tighter" style={{ fontSize: '110%' }}>
              A
            </span>
          </div>

          {/* Mini 4-point Neobrutalist Sparkle in Top Right */}
          <div className="absolute top-[4%] right-[8%] z-30 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 fill-rose-500">
              <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" stroke="#000" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'icon-only') {
    return Icon1to1;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {Icon1to1}

      <div className="flex flex-col justify-center leading-none select-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black uppercase tracking-tight text-neutral-900 ${currentSize.text}`}>
            PORTAL ASESMEN
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 bg-yellow-300 text-black border border-black rounded text-[9px] font-black uppercase shadow-[1px_1px_0px_#000]">
            PRO
          </span>
        </div>
        <span className={`font-bold text-neutral-600 tracking-wide mt-0.5 uppercase ${currentSize.sub}`}>
          Administrasi & Kartu Ujian Sekolah
        </span>
      </div>
    </div>
  );
};
