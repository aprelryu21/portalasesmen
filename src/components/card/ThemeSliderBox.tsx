import React, { useRef } from 'react';
import { CARD_THEMES, CardThemeItem, COLOR_SWATCH_PRESETS } from '../../config/cardThemes';
import { ChevronLeft, ChevronRight, Check, Palette, RotateCcw, Sparkles } from 'lucide-react';

interface ThemeSliderBoxProps {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  baseColor?: string;
  onChangeBaseColor?: (newColor: string) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ThemeSliderBox: React.FC<ThemeSliderBoxProps> = ({
  selectedThemeId,
  onSelectTheme,
  baseColor,
  onChangeBaseColor,
  title = '10 Tema Desain Kartu',
  subtitle = 'Geser untuk memilih tema kartu. Klik warna untuk merubah warna dasar tema.',
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  const currentBaseColor = baseColor || activeTheme.defaultBaseColor;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className={`no-print bg-white border-2 border-black rounded-xl p-3 sm:p-3.5 shadow-[3px_3px_0px_#000] space-y-3 ${className}`}>
      {/* Header bar with title and navigation arrows */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-tight text-neutral-900 truncate">
              {title}
            </h4>
            <span className="px-1.5 py-0.2 bg-yellow-300 border border-black rounded text-[9px] font-mono font-bold shrink-0">
              10 Pilihan
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-neutral-500 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Kotak Geser Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={scrollLeft}
            className="w-7 h-7 bg-neutral-100 hover:bg-yellow-300 border border-black rounded-lg flex items-center justify-center transition-colors shadow-[1px_1px_0px_#000] active:translate-y-0.5 cursor-pointer"
            title="Geser ke kiri"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="w-7 h-7 bg-neutral-100 hover:bg-yellow-300 border border-black rounded-lg flex items-center justify-center transition-colors shadow-[1px_1px_0px_#000] active:translate-y-0.5 cursor-pointer"
            title="Geser ke kanan"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Kotak Geser Horizontal Carousel Slider */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar select-none"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {CARD_THEMES.map((theme, idx) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              style={{ scrollSnapAlign: 'start' }}
              className={`shrink-0 w-[145px] sm:w-[155px] p-2.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-yellow-50 border-black shadow-[3px_3px_0px_#000] ring-2 ring-black font-black'
                  : 'bg-white border-neutral-300 hover:border-black hover:bg-neutral-50 shadow-[1px_1px_0px_#000]'
              }`}
            >
              {/* Badge Checkmark on Active */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[9px]">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Theme Color Preview Swatch Bar */}
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  style={{ backgroundColor: theme.defaultBaseColor }}
                  className="w-5 h-5 rounded-md border border-black shadow-[1px_1px_0px_#000] shrink-0"
                />
                <div
                  style={{ backgroundColor: theme.accentColor }}
                  className="w-3.5 h-3.5 rounded-full border border-black shrink-0"
                />
                <span className="text-[9px] font-mono text-neutral-400 font-bold ml-auto">
                  #{idx + 1}
                </span>
              </div>

              {/* Theme Name & Category */}
              <div>
                <div className="text-[11px] font-black text-neutral-900 leading-tight truncate">
                  {theme.name}
                </div>
                <div className="text-[9px] text-neutral-500 font-bold truncate mt-0.5">
                  {theme.category}
                </div>
              </div>

              {/* Mini preview frame shape tag */}
              <div className="mt-2 pt-1.5 border-t border-neutral-200/80 flex items-center justify-between text-[8px] text-neutral-600">
                <span className="truncate opacity-80">{theme.fontFamilyClass.includes('serif') ? 'Serif' : theme.fontFamilyClass.includes('mono') ? 'Monospace' : 'Sans Bold'}</span>
                <span className="font-mono text-[7.5px] uppercase font-bold px-1 bg-neutral-100 rounded">
                  {theme.photoFrameShape.replace('_', ' ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Opsi Ubah Warna Dasar Tema */}
      {onChangeBaseColor && (
        <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-neutral-800 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-neutral-600" />
              Warna Dasar:
            </span>

            {/* Quick Swatch Palette Circles */}
            <div className="flex items-center gap-1 flex-wrap">
              {COLOR_SWATCH_PRESETS.slice(0, 8).map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => onChangeBaseColor(swatch.hex)}
                  title={`${swatch.name} (${swatch.hex})`}
                  style={{ backgroundColor: swatch.hex }}
                  className={`w-5 h-5 rounded-full border border-black transition-transform hover:scale-110 cursor-pointer ${
                    currentBaseColor.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'ring-2 ring-black scale-110 shadow-[1px_1px_0px_#000]'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Native HTML5 Color Picker & Reset Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 border border-black rounded-lg">
              <input
                type="color"
                value={currentBaseColor.startsWith('#') ? currentBaseColor : activeTheme.defaultBaseColor}
                onChange={(e) => onChangeBaseColor(e.target.value)}
                className="w-5 h-5 rounded border border-neutral-400 cursor-pointer p-0 bg-transparent"
                title="Pilih Warna Kustom"
              />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-800">
                {currentBaseColor}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onChangeBaseColor(activeTheme.defaultBaseColor)}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#000]"
              title="Kembalikan ke warna asli tema"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
