import React, { useState, useMemo } from 'react';
import { School, Exam, Student } from '../../types';
import { DeskCard } from '../card/DeskCard';
import { PinchZoomCardContainer } from '../card/PinchZoomCardContainer';
import { ThemeSliderBox } from '../card/ThemeSliderBox';
import { A4SheetContainer } from './A4SheetContainer';
import { PrintConfirmationModal } from './PrintConfirmationModal';
import {
  Printer,
  ArrowLeft,
  LayoutGrid,
  Settings2,
  Users,
  AlertCircle,
  Scissors,
  ZoomIn,
  X,
  Compass,
} from 'lucide-react';

interface DeskCardPrintProps {
  school: School;
  exam: Exam;
  students: Student[];
  selectedStudentIds: string[];
  onSelectAllStudents?: (selected: boolean) => void;
  onBackToMenu: () => void;
}

export const DeskCardPrint: React.FC<DeskCardPrintProps> = ({
  school,
  exam,
  students,
  selectedStudentIds,
  onSelectAllStudents,
  onBackToMenu,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');
  const [cardFormat, setCardFormat] = useState<'standard' | 'compact'>('standard'); // standard: 4 per A4, compact: 6 per A4
  const [deskThemeId, setDeskThemeId] = useState<string>('neobrutal');
  const [deskThemeColor, setDeskThemeColor] = useState<string>('');
  const [deskOrientation, setDeskOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [showSettings, setShowSettings] = useState(false);
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);

  // Filter students based on selection
  const printableStudents = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueStudents = (students || []).filter((s) => {
      if (!s || !s.id) return false;
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    });

    if (filterMode === 'all') {
      return uniqueStudents;
    }
    const selectedSet = new Set(selectedStudentIds);
    return uniqueStudents.filter((s) => selectedSet.has(s.id));
  }, [students, selectedStudentIds, filterMode]);

  // Pagination calculation
  const cardsPerPage = cardFormat === 'compact' ? 6 : 4;
  const pages: Student[][] = useMemo(() => {
    const p: Student[][] = [];
    for (let i = 0; i < printableStudents.length; i += cardsPerPage) {
      p.push(printableStudents.slice(i, i + cardsPerPage));
    }
    return p.length > 0 ? p : [[]];
  }, [printableStudents, cardsPerPage]);

  const handlePrint = () => {
    setIsPrintConfirmOpen(true);
  };

  const handleExecutePrint = () => {
    setIsPrintConfirmOpen(false);
    setTimeout(() => {
      window.focus();
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP TOOLBAR (Hidden on Print) */}
      <div className="no-print bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Pilihan Kartu Lain
          </button>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-amber-600" />
              ID Tempat Duduk / Kartu Meja Ujian
            </h2>
            <p className="text-xs font-medium text-neutral-600">
              {printableStudents.length} kartu meja siap dicetak ({pages.length} lembar A4 •{' '}
              {cardFormat === 'compact' ? '6 kartu/lembar' : '4 kartu/lembar'}).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Orientasi Kartu Meja */}
          <div className="flex bg-neutral-100 p-1 border-2 border-black rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setDeskOrientation('landscape')}
              className={`px-3 py-1 rounded transition-colors ${
                deskOrientation === 'landscape'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Lanskap ↔
            </button>
            <button
              type="button"
              onClick={() => setDeskOrientation('portrait')}
              className={`px-3 py-1 rounded transition-colors ${
                deskOrientation === 'portrait'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Potret ↕
            </button>
          </div>

          {/* Format Switcher */}
          <div className="flex bg-neutral-100 p-1 border-2 border-black rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setCardFormat('standard')}
              className={`px-3 py-1 rounded transition-colors ${
                cardFormat === 'standard'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              4 Kartu / A4 (Besar)
            </button>
            <button
              type="button"
              onClick={() => setCardFormat('compact')}
              className={`px-3 py-1 rounded transition-colors ${
                cardFormat === 'compact'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              6 Kartu / A4 (Hemat)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Pengaturan Cetak
          </button>

          {/* PRINT BUTTON */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Kartu Meja Sekarang
          </button>
        </div>
      </div>

      {/* Theme Selection Slider Box */}
      <ThemeSliderBox
        selectedThemeId={deskThemeId}
        onSelectTheme={(id) => setDeskThemeId(id)}
        baseColor={deskThemeColor}
        onChangeBaseColor={(col) => setDeskThemeColor(col)}
        title="10 Pilihan Tema ID Bangku / Kartu Meja"
        subtitle="Geser untuk memilih tema. Sesuaikan warna dasar kartu meja sebelum dicetak."
      />

      {/* 2. SETTINGS DRAWER */}
      {showSettings && (
        <div className="no-print bg-[#FEF9C3] border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-black text-black mb-1">Target Siswa</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as 'all' | 'selected')}
              className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
            >
              <option value="all">Cetak Seluruh Siswa ({students.length})</option>
              <option value="selected">Cetak Siswa Terpilih ({selectedStudentIds.length})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">Format Tata Letak</label>
            <select
              value={cardFormat}
              onChange={(e) => setCardFormat(e.target.value as 'standard' | 'compact')}
              className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
            >
              <option value="standard">Format 4 Meja per A4 (Dimensi: ~132 x 92 mm)</option>
              <option value="compact">Format 6 Meja per A4 (Dimensi: ~95 x 68 mm)</option>
            </select>
          </div>

          <div className="flex items-center text-xs text-neutral-700 bg-white p-2.5 border-2 border-black rounded-lg">
            <Scissors className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
            <span>Kartu meja telah dilengkapi garis pembatas gunting untuk memudahkan pemotongan.</span>
          </div>
        </div>
      )}

      {/* 3. A4 SHEETS CONTAINER */}
      <div className="print-only-container flex flex-col items-center gap-8 py-4">
        {printableStudents.length === 0 ? (
          <div className="no-print bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-8 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-sm font-black uppercase">Belum ada siswa yang dipilih</h3>
            <p className="text-xs text-neutral-600 mt-1 mb-4">
              Aktifkan opsi "Cetak Seluruh Siswa" atau pilih siswa di tabel data siswa.
            </p>
            {onSelectAllStudents && (
              <button
                type="button"
                onClick={() => {
                  onSelectAllStudents(true);
                  setFilterMode('all');
                }}
                className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
              >
                Pilih Semua Siswa ({students.length})
              </button>
            )}
          </div>
        ) : (
          pages.map((pageStudents, pageIdx) => (
            <A4SheetContainer
              key={pageIdx}
              pageNumber={pageIdx + 1}
              totalPages={pages.length}
              totalCards={pageStudents.length}
              orientation="portrait"
              marginMm={8}
              className={pageIdx < pages.length - 1 ? 'page-break-after' : ''}
            >
              {/* GRID KARTU MEJA */}
              <div
                className={`w-full grid ${
                  cardFormat === 'compact'
                    ? 'grid-cols-2 gap-x-4 gap-y-4 justify-items-center'
                    : 'grid-cols-2 gap-x-4 gap-y-6 justify-items-center pt-2'
                }`}
              >
                {pageStudents.map((student, sIdx) => (
                  <div key={`${student.id}_${sIdx}`} className="print-card-item relative group">
                    <button
                      type="button"
                      onClick={() => setInspectedStudent(student)}
                      className="no-print absolute top-1.5 right-1.5 px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 text-black border border-black rounded text-[9.5px] font-black shadow-[1px_1px_0px_#000] flex items-center gap-1 z-20 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Perbesar & Inspeksi Kartu Meja Ini (Pinch-to-Zoom)"
                    >
                      <ZoomIn className="w-2.5 h-2.5" />
                      <span>Zoom</span>
                    </button>
                    <DeskCard
                      student={student}
                      school={school}
                      exam={exam}
                      cardSize={cardFormat}
                      orientation={deskOrientation}
                      themeId={deskThemeId}
                      themeColor={deskThemeColor}
                    />
                  </div>
                ))}
              </div>
            </A4SheetContainer>
          ))
        )}
      </div>

      {/* Pop-up Konfirmasi Cetak Kartu Meja */}
      <PrintConfirmationModal
        isOpen={isPrintConfirmOpen}
        onClose={() => setIsPrintConfirmOpen(false)}
        onConfirm={handleExecutePrint}
        cardType="Kartu Meja / ID Tempat Duduk Ujian"
        itemCount={printableStudents.length}
        estimatedSheets={pages.length}
        orientation="portrait"
      />

      {/* Modal Overlay Inspeksi Pinch-to-Zoom Kartu Meja */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-3 bg-amber-300 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ZoomIn className="w-4 h-4 text-black shrink-0" />
                <span className="text-xs font-black uppercase truncate">
                  Inspeksi Kartu Meja: {inspectedStudent.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="p-1 bg-white hover:bg-neutral-100 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-4 flex-1 overflow-auto bg-neutral-100">
              <PinchZoomCardContainer
                cardTitle={`Meja: ${inspectedStudent.examSeat || '-'}`}
                badgeLabel={`Ruang ${inspectedStudent.examRoom || '-'}`}
                initialScale={1.15}
                maxScale={4.0}
              >
                <DeskCard
                  student={inspectedStudent}
                  school={school}
                  exam={exam}
                  cardSize={cardFormat}
                  orientation={deskOrientation}
                  themeId={deskThemeId}
                  themeColor={deskThemeColor}
                />
              </PinchZoomCardContainer>
            </div>

            <div className="p-3 bg-white border-t-2 border-black flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-600 font-bold">
                Meja: {inspectedStudent.examSeat || '-'} • Ruang: {inspectedStudent.examRoom || '-'}
              </span>
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Selesai Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
