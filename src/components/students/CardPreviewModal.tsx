import React from 'react';
import { School, Exam, Student, CardDesignSettings } from '../../types';
import { ExamCard } from '../card/ExamCard';
import { X, Printer } from 'lucide-react';

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  school: School;
  exam: Exam;
  design: CardDesignSettings;
  onPrintSingle: () => void;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  isOpen,
  onClose,
  student,
  school,
  exam,
  design,
  onPrintSingle,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">
              Pratinjau Kartu: {student.name}
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              NISN: {student.nisn} • {student.className}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Display Area */}
        <div className="my-6 p-6 bg-[#F7F4EB] border-2 border-dashed border-neutral-400 rounded-xl flex items-center justify-center overflow-auto">
          <ExamCard
            student={student}
            school={school}
            exam={exam}
            design={design}
            scale={1.3}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPrintSingle();
            }}
            className="px-4 py-2 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Kartu Siswa Ini
          </button>
        </div>
      </div>
    </div>
  );
};
