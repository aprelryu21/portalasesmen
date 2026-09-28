import React, { useState } from 'react';
import {
  School,
  Exam,
  AnswerSheetDesignSettings,
  AnswerSheetTemplateStyle,
} from '../../types';
import {
  Printer,
  ArrowLeft,
  Settings2,
  FileText,
  Building2,
  Calendar,
  Layers,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface AnswerSheetPrintProps {
  school: School;
  exam: Exam;
  exams?: Exam[];
  answerSheetDesign: AnswerSheetDesignSettings;
  onNavigateToDesigner?: () => void;
  onBackToMenu?: () => void;
}

export const AnswerSheetPrint: React.FC<AnswerSheetPrintProps> = ({
  school,
  exam,
  exams = [],
  answerSheetDesign,
  onNavigateToDesigner,
  onBackToMenu,
}) => {
  // Assessment info state to be printed
  const [selectedExamId, setSelectedExamId] = useState<string>(exam?.id || exam?.name || '');
  const [customExamTitle, setCustomExamTitle] = useState<string>(
    exam?.name ? exam.name.toUpperCase() : answerSheetDesign?.identity?.examTitle || 'ASESMEN SUMATIF'
  );
  const [customYearTitle, setCustomYearTitle] = useState<string>(
    exam?.academicYear
      ? `TAHUN PELAJARAN ${exam.academicYear}`
      : answerSheetDesign?.identity?.yearTitle || 'TAHUN PELAJARAN 2024 – 2025'
  );

  // Optional pre-filled fields
  const [subjectText, setSubjectText] = useState<string>('');
  const [classText, setClassText] = useState<string>('');
  const [dateText, setDateText] = useState<string>(exam?.dateText || '');
  const [copiesCount, setCopiesCount] = useState<number>(1);

  // Handle changing exam from list
  const handleSelectExam = (chosenExamId: string) => {
    setSelectedExamId(chosenExamId);
    const chosen = exams.find((e) => (e.id || e.name) === chosenExamId);
    if (chosen) {
      if (chosen.name) setCustomExamTitle(chosen.name.toUpperCase());
      if (chosen.academicYear) setCustomYearTitle(`TAHUN PELAJARAN ${chosen.academicYear}`);
      if (chosen.dateText) setDateText(chosen.dateText);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const { kop, identity, questions, fontFamily } = answerSheetDesign;
  const activeLogoUrl = kop?.logoUrl || school?.logoUrl || '';

  // Calculate question summary
  const totalQuestions =
    (questions.enablePg ? questions.pgCount : 0) +
    (questions.enableIsian ? questions.isianCount : 0) +
    (questions.enableUraian ? questions.uraianCount : 0);

  // Estimasi muat 1 lembar
  const isEstimatedSinglePage =
    (!questions.enablePg || questions.pgCount <= 25) &&
    (!questions.enableIsian || questions.isianCount <= 10) &&
    (!questions.enableUraian || questions.uraianCount <= 5);

  return (
    <div className="space-y-6">
      {/* Dynamic Print CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            html, body {
              background: white !important;
              color: black !important;
              height: auto !important;
              min-height: auto !important;
            }
            .no-print {
              display: none !important;
            }
            .print-only-container {
              display: block !important;
              width: 100% !important;
            }
            .a4-print-sheet {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
              page-break-after: always;
              break-after: page;
            }
            .a4-print-sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
          @media screen {
            .print-only-container {
              display: none;
            }
          }
        `,
        }}
      />

      {/* 1. TOP HEADER & NAVIGATION BAR (NO-PRINT) */}
      <div className="no-print bg-emerald-400 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBackToMenu && (
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="px-3 py-1 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-black" />
                  <span>Koleksi Cetak</span>
                </button>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase">
                <FileText className="w-3 h-3 text-emerald-300" />
                <span>Pusat Cetak Lembar Jawaban (LJ) A4</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
              Cetak Lembar Jawaban Asesmen Siswa
            </h2>
            <p className="text-xs sm:text-sm text-neutral-800 font-medium">
              Tentukan nama asesmen, mata pelajaran, dan jumlah cetakan sebelum mencetak lembar jawaban resmi ukuran A4.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {onNavigateToDesigner && (
              <button
                type="button"
                onClick={onNavigateToDesigner}
                className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <Settings2 className="w-4 h-4 text-black" />
                <span>Ubah Desain LJ</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-yellow-300 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[4px_4px_0px_#000] flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>Cetak Lembar Jawaban (A4)</span>
            </button>
          </div>
        </div>

        {/* Quick Context Chips */}
        <div className="pt-3 border-t-2 border-neutral-900/15 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-neutral-800 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              <Building2 className="w-3.5 h-3.5 text-neutral-700" />
              <span>{kop?.line3 || school?.name || 'Sekolah'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-neutral-800 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              <Layers className="w-3.5 h-3.5 text-neutral-700" />
              <span>Total: {totalQuestions} Butir Soal</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-neutral-800 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEstimatedSinglePage ? '1 Halaman A4' : '2 Halaman A4'}</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-neutral-800 font-bold">
            Kertas: Standar A4 Portrait (210 × 297 mm)
          </span>
        </div>
      </div>

      {/* 2. TOOLBAR PENGATURAN INFORMASI CETAK (NO-PRINT) */}
      <div className="no-print bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-black flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-900" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-neutral-900">
              Formulir Data Cetak Lembar Jawaban
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              Sesuaikan nama asesmen dan mata pelajaran yang akan langsung tercetak pada lembar jawaban.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pilih / Tentukan Nama Asesmen */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-neutral-800 flex items-center justify-between">
              <span>Nama Asesmen Tercetak</span>
              {exams.length > 0 && <span className="text-[10px] text-neutral-500 font-normal">Pilih / Ketik</span>}
            </label>
            {exams.length > 0 && (
              <select
                value={selectedExamId}
                onChange={(e) => handleSelectExam(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 mb-1 cursor-pointer"
              >
                <option value="">-- Pilih dari Asesmen Tersimpan --</option>
                {exams.map((ex) => (
                  <option key={ex.id || ex.name} value={ex.id || ex.name}>
                    {ex.name} {ex.semester ? `• ${ex.semester}` : ''}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={customExamTitle}
              onChange={(e) => setCustomExamTitle(e.target.value)}
              placeholder="ASESMEN SUMATIF AKHIR SEMESTER 1"
              className="w-full px-3 py-1.5 text-xs font-black uppercase border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Tahun Pelajaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-neutral-800">
              Tahun Pelajaran
            </label>
            <input
              type="text"
              value={customYearTitle}
              onChange={(e) => setCustomYearTitle(e.target.value)}
              placeholder="TAHUN PELAJARAN 2024 – 2025"
              className="w-full px-3 py-1.5 text-xs font-bold uppercase border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Mata Pelajaran (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-neutral-800 flex items-center justify-between">
              <span>Mata Pelajaran (Opsional)</span>
              <span className="text-[10px] text-neutral-500 font-normal">Bisa kosong</span>
            </label>
            <input
              type="text"
              value={subjectText}
              onChange={(e) => setSubjectText(e.target.value)}
              placeholder="Biarkan kosong jika ingin diisi siswa"
              className="w-full px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Kelas (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-neutral-800 flex items-center justify-between">
              <span>Kelas (Opsional)</span>
              <span className="text-[10px] text-neutral-500 font-normal">Bisa kosong</span>
            </label>
            <input
              type="text"
              value={classText}
              onChange={(e) => setClassText(e.target.value)}
              placeholder="Biarkan kosong jika ingin diisi siswa"
              className="w-full px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Hari / Tanggal (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-neutral-800 flex items-center justify-between">
              <span>Hari / Tanggal (Opsional)</span>
              <span className="text-[10px] text-neutral-500 font-normal">Bisa kosong</span>
            </label>
            <input
              type="text"
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              placeholder="Senin, 02 Desember 2024"
              className="w-full px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Jumlah Lembar Cetak (Copy count) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-neutral-800 flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-neutral-600" />
              <span>Jumlah Cetak Lembar (Eksemplar)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={500}
                value={copiesCount}
                onChange={(e) => setCopiesCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 text-xs font-black border-2 border-black rounded-lg"
              />
              <span className="text-xs text-neutral-600 font-medium">lembar sekaligus</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SCREEN PREVIEW CARD (NO-PRINT) */}
      <div className="no-print bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-100">
          <div>
            <h3 className="text-base font-black uppercase text-neutral-900">
              Pratinjau Lembar Siap Cetak (A4)
            </h3>
            <p className="text-xs text-neutral-500">
              Tampilan berikut adalah hasil persis yang akan tercetak di kertas printer Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>Cetak Sekarang</span>
          </button>
        </div>

        {/* Scaled Preview Sheet */}
        <div className="flex justify-center p-3 sm:p-6 bg-neutral-100/70 rounded-xl border border-neutral-200 overflow-x-auto">
          <RenderAnswerSheetDocument
            design={answerSheetDesign}
            school={school}
            examTitle={customExamTitle}
            yearTitle={customYearTitle}
            subjectText={subjectText}
            classText={classText}
            dateText={dateText}
            activeLogoUrl={activeLogoUrl}
          />
        </div>
      </div>

      {/* 4. PRINT-ONLY CONTAINER (RENDERED TO PRINTER DIRECTLY) */}
      <div className="print-only-container">
        {Array.from({ length: copiesCount }).map((_, copyIdx) => (
          <div key={copyIdx} className="a4-print-sheet">
            <RenderAnswerSheetDocument
              design={answerSheetDesign}
              school={school}
              examTitle={customExamTitle}
              yearTitle={customYearTitle}
              subjectText={subjectText}
              classText={classText}
              dateText={dateText}
              activeLogoUrl={activeLogoUrl}
              isPrintMode={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Reusable Paper Document renderer for both on-screen preview and clean A4 printing
 */
interface RenderDocProps {
  design: AnswerSheetDesignSettings;
  school: School;
  examTitle: string;
  yearTitle: string;
  subjectText: string;
  classText: string;
  dateText: string;
  activeLogoUrl: string;
  isPrintMode?: boolean;
}

const RenderAnswerSheetDocument: React.FC<RenderDocProps> = ({
  design,
  examTitle,
  yearTitle,
  subjectText,
  classText,
  dateText,
  activeLogoUrl,
  isPrintMode = false,
}) => {
  const { kop, identity, questions, fontFamily } = design;
  const templateStyle: AnswerSheetTemplateStyle = design.templateStyle || 'classic';

  return (
    <div
      className={`w-full max-w-[210mm] bg-white text-black p-6 sm:p-8 space-y-3.5 ${
        isPrintMode ? '' : 'border-2 border-neutral-400 shadow-xl'
      } ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
      style={{
        boxSizing: 'border-box',
        minHeight: isPrintMode ? 'auto' : '297mm',
      }}
    >
      {/* KOP SURAT */}
      <div className="flex items-center gap-4 pb-2">
        {kop.showLogo && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            {activeLogoUrl ? (
              <img
                src={activeLogoUrl}
                alt="Logo Sekolah"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-neutral-400 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 text-center font-bold">
                Logo
              </div>
            )}
          </div>
        )}

        <div className="flex-1 text-center space-y-0.5">
          {kop.line1 && (
            <div className="text-[11px] sm:text-[13px] font-bold tracking-wide uppercase leading-tight">
              {kop.line1}
            </div>
          )}
          {kop.line2 && (
            <div className="text-[11px] sm:text-[13px] font-bold tracking-wide uppercase leading-tight">
              {kop.line2}
            </div>
          )}
          {kop.line3 && (
            <div className="text-[14px] sm:text-[17px] font-black tracking-wide uppercase leading-tight">
              {kop.line3}
            </div>
          )}
          {kop.line4 && (
            <div className="text-[9px] sm:text-[10.5px] leading-tight text-neutral-800">
              {kop.line4}
            </div>
          )}
          {kop.line5 && (
            <div className="text-[9px] sm:text-[10px] leading-tight text-neutral-700">
              {kop.line5}
            </div>
          )}
        </div>
      </div>

      {/* GARIS PEMBATAS KOP SURAT */}
      {renderKopDivider(templateStyle)}

      {/* TABEL IDENTITAS & NILAI (BOXED TABLE SESUAI FOTO) */}
      <div className={getTableClassName(templateStyle)}>
        {/* Row Atas: Judul Asesmen & Kotak Nilai */}
        <div className="grid grid-cols-4 border-b border-black">
          <div className="col-span-3 p-2 text-center border-r border-black flex flex-col justify-center">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider">
              {identity.title || 'LEMBAR JAWABAN'}
            </div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-wide">
              {examTitle || identity.examTitle || 'ASESMEN SUMATIF'}
            </div>
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wide">
              {yearTitle || identity.yearTitle || 'TAHUN PELAJARAN 2024 – 2025'}
            </div>
          </div>

          <div
            className={`col-span-1 p-1.5 flex flex-col justify-between ${
              templateStyle === 'modern' ? 'bg-neutral-50/50' : ''
            }`}
            style={{ minHeight: '68px' }}
          >
            <div className="text-[11px] font-bold text-neutral-800">
              {identity.scoreLabel || 'Nilai:'}
            </div>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Row Bawah: 2 Kolom Identitas Siswa */}
        <div className="grid grid-cols-2 text-[11px] sm:text-xs font-medium">
          {/* Kolom Kiri */}
          <div className="border-r border-black">
            <div className="flex items-center px-2 py-1 border-b border-black">
              <span className="w-20 font-bold shrink-0">{identity.nameLabel || 'Nama / No'}</span>
              <span className="mr-1.5 font-bold">:</span>
              <span className="flex-1 text-neutral-400 truncate">
                ............................................ / ......
              </span>
            </div>
            <div className="flex items-center px-2 py-1">
              <span className="w-20 font-bold shrink-0">{identity.classLabel || 'Kelas'}</span>
              <span className="mr-1.5 font-bold">:</span>
              <span className={`flex-1 truncate ${classText ? 'font-bold text-black' : 'text-neutral-400'}`}>
                {classText ? classText : '............................................'}
              </span>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div>
            <div className="flex items-center px-2 py-1 border-b border-black">
              <span className="w-24 font-bold shrink-0">{identity.subjectLabel || 'Mata Pelajaran'}</span>
              <span className="mr-1.5 font-bold">:</span>
              <span className={`flex-1 truncate ${subjectText ? 'font-bold text-black' : 'text-neutral-400'}`}>
                {subjectText ? subjectText : '............................................'}
              </span>
            </div>
            <div className="flex items-center px-2 py-1">
              <span className="w-24 font-bold shrink-0">{identity.dateLabel || 'Hari / Tanggal'}</span>
              <span className="mr-1.5 font-bold">:</span>
              <span className={`flex-1 truncate ${dateText ? 'font-bold text-black' : 'text-neutral-400'}`}>
                {dateText ? dateText : '............................................'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN I: PILIHAN GANDA */}
      {questions.enablePg && (
        <div
          className="space-y-1.5 pt-1 break-inside-avoid"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <div className={getSectionHeaderClassName(templateStyle)}>
            <span>I. PILIHAN GANDA</span>
            <span className="text-[10px] font-normal normal-case text-neutral-600">
              Berikan tanda silang (X) atau hitamkan salah satu huruf pilihan jawaban yang benar!
            </span>
          </div>

          {renderPrintPgSection(questions.pgCount, questions.pgOptions, templateStyle)}
        </div>
      )}

      {/* BAGIAN II: ISIAN SINGKAT */}
      {questions.enableIsian && (
        <div
          className="space-y-1.5 pt-1.5 break-inside-avoid"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <div className={getSectionHeaderClassName(templateStyle)}>
            <span>II. ISIAN SINGKAT</span>
          </div>

          {renderPrintIsianColumns(questions.isianCount)}
        </div>
      )}

      {/* BAGIAN III: URAIAN */}
      {questions.enableUraian && (
        <div
          className="space-y-1.5 pt-1.5 break-inside-avoid"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <div className={getSectionHeaderClassName(templateStyle)}>
            <span>III. URAIAN</span>
          </div>

          <div className="space-y-2 text-[11px] pt-0.5">
            {Array.from({ length: questions.uraianCount }).map((_, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <span>{idx + 1}.</span>
                  <div className="flex-1 border-b border-black/40 h-3"></div>
                </div>
                {Array.from({ length: (questions.uraianRowsPerNumber || 3) - 1 }).map((_, rIdx) => (
                  <div key={rIdx} className="w-full border-b border-black/40 h-3"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tanda Tangan Orang Tua / Peserta */}
      <div
        className="pt-3 flex items-center justify-between text-[10px] text-neutral-700 break-inside-avoid"
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        <div className="text-center w-36">
          <div>Tanda Tangan Peserta</div>
          <div className="h-9"></div>
          <div className="border-b border-dotted border-black"></div>
        </div>

        <div className="text-center w-36">
          <div>Paraf Pengawas</div>
          <div className="h-9"></div>
          <div className="border-b border-dotted border-black"></div>
        </div>
      </div>
    </div>
  );
};

function renderPrintPgSection(
  count: number,
  options: 'ABCD' | 'ABCDE',
  templateStyle: AnswerSheetTemplateStyle = 'classic'
) {
  const letters = options === 'ABCDE' ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
  const rowsPerCol = count === 50 ? 10 : 5;
  const numColumns = Math.ceil(count / rowsPerCol);

  const columns = [];
  for (let col = 0; col < numColumns; col++) {
    const startNum = col * rowsPerCol + 1;
    const endNum = Math.min((col + 1) * rowsPerCol, count);
    const colItems = [];

    for (let num = startNum; num <= endNum; num++) {
      colItems.push(
        <div
          key={num}
          className={`flex items-center gap-1.5 py-0.5 border-b ${
            templateStyle === 'geometric'
              ? 'border-neutral-300'
              : templateStyle === 'modern'
              ? 'border-neutral-100'
              : 'border-neutral-200/60'
          }`}
        >
          <span className="w-5 font-bold text-neutral-900 shrink-0 text-[10px] sm:text-[11px] text-right">
            {num}.
          </span>
          <div className="flex items-center gap-1">
            {letters.map((letter) => (
              <span
                key={letter}
                className={getBubbleClassName(templateStyle)}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      );
    }

    columns.push(
      <div key={col} className="space-y-0.5 flex-1 min-w-[100px]">
        {colItems}
      </div>
    );
  }

  // Atur grid agar berjarak proporsional dan tidak meninggalkan space kosong lebar di kanan
  let gridClass = 'grid gap-y-2 text-[11px] pt-1 w-full';
  if (numColumns === 2) {
    gridClass += ' grid-cols-2 gap-x-12 sm:gap-x-20 max-w-xl mx-auto';
  } else if (numColumns === 3) {
    gridClass += ' grid-cols-3 gap-x-8 max-w-2xl mx-auto';
  } else if (numColumns === 4) {
    gridClass += ' grid-cols-2 sm:grid-cols-4 gap-x-6';
  } else {
    gridClass += ' grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-3.5';
  }

  return <div className={gridClass}>{columns}</div>;
}

function renderPrintIsianColumns(count: number) {
  const rowsPerCol = 5;
  const numColumns = Math.ceil(count / rowsPerCol);

  const columns = [];
  for (let col = 0; col < numColumns; col++) {
    const startNum = col * rowsPerCol + 1;
    const endNum = Math.min((col + 1) * rowsPerCol, count);
    const colItems = [];

    for (let num = startNum; num <= endNum; num++) {
      colItems.push(
        <div key={num} className="flex items-center gap-1.5 py-0.5">
          <span className="w-5 font-bold shrink-0 text-right text-neutral-900">{num}.</span>
          <span className="flex-1 border-b border-dotted border-black h-4"></span>
        </div>
      );
    }

    columns.push(
      <div key={col} className="space-y-1 flex-1 min-w-[130px]">
        {colItems}
      </div>
    );
  }

  const gridClass =
    numColumns === 1
      ? 'grid grid-cols-1 max-w-md'
      : numColumns === 2
      ? 'grid grid-cols-2 gap-x-12 sm:gap-x-16 max-w-xl mx-auto'
      : numColumns === 3
      ? 'grid grid-cols-3 gap-x-8'
      : 'grid grid-cols-4 gap-x-6';

  return (
    <div className={`${gridClass} gap-y-2 text-[11px] pt-1 w-full`}>
      {columns}
    </div>
  );
}

function renderKopDivider(style: AnswerSheetTemplateStyle = 'classic') {
  switch (style) {
    case 'modern':
      return <div className="border-b-2 border-neutral-900 pb-0.5"></div>;
    case 'geometric':
      return <div className="border-b-[3.5px] border-black pb-0.5"></div>;
    case 'elegant':
      return (
        <div className="border-b-[3px] border-black pb-[1.5px]">
          <div className="border-b border-black"></div>
        </div>
      );
    case 'compact':
      return <div className="border-b-[1.5px] border-black pb-0.5"></div>;
    case 'classic':
    default:
      return (
        <div className="border-b-[3px] border-black pb-[1.5px]">
          <div className="border-b border-black"></div>
        </div>
      );
  }
}

function getTableClassName(style: AnswerSheetTemplateStyle = 'classic') {
  switch (style) {
    case 'modern':
      return 'border-2 border-neutral-900 rounded-lg overflow-hidden text-black bg-white shadow-xs';
    case 'geometric':
      return 'border-2 border-black text-black font-semibold bg-white';
    case 'elegant':
      return 'border-2 border-black text-black bg-white shadow-xs';
    case 'compact':
      return 'border-[1.5px] border-black text-black text-[10.5px]';
    case 'classic':
    default:
      return 'border-2 border-black text-black bg-white';
  }
}

function getSectionHeaderClassName(style: AnswerSheetTemplateStyle = 'classic') {
  switch (style) {
    case 'modern':
      return 'flex items-center justify-between text-xs font-black uppercase pb-1 border-b-2 border-neutral-900';
    case 'geometric':
      return 'flex items-center justify-between text-xs font-black uppercase bg-black text-white px-2 py-1 mb-1';
    case 'elegant':
      return 'flex items-center justify-between text-xs font-black uppercase border-b-2 border-black border-double pb-1 tracking-wider';
    case 'compact':
      return 'flex items-center justify-between text-[11px] font-black uppercase border-b border-black/80 pb-0.5';
    case 'classic':
    default:
      return 'flex items-center justify-between text-xs font-black uppercase border-b border-black pb-0.5';
  }
}

function getBubbleClassName(style: AnswerSheetTemplateStyle = 'classic') {
  switch (style) {
    case 'modern':
      return 'w-4 h-4 rounded-full border-2 border-neutral-800 flex items-center justify-center text-[9px] font-black text-neutral-900 select-none';
    case 'geometric':
      return 'w-4 h-4 rounded-full border-2 border-black flex items-center justify-center text-[9px] font-black text-black bg-white select-none';
    case 'elegant':
      return 'w-4 h-4 rounded-full border border-black shadow-[0.5px_0.5px_0px_#000] flex items-center justify-center text-[9px] font-bold text-neutral-900 select-none';
    case 'compact':
      return 'w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[8.5px] font-black text-neutral-900 select-none';
    case 'classic':
    default:
      return 'w-4 h-4 rounded-full border border-black flex items-center justify-center text-[9px] font-bold text-neutral-900 select-none';
  }
}
