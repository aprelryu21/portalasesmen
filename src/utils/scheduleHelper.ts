import { ExamScheduleItem } from '../types';

export const DAYS_OF_WEEK = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export const createDefaultScheduleDays = (): ExamScheduleItem[] => [
  { id: 'day_1', day: 'Senin', date: '', time: '07.30 - 09.30', subject: '', time2: '', subject2: '' },
  { id: 'day_2', day: 'Selasa', date: '', time: '07.30 - 09.30', subject: '', time2: '', subject2: '' },
  { id: 'day_3', day: 'Rabu', date: '', time: '07.30 - 09.30', subject: '', time2: '', subject2: '' },
  { id: 'day_4', day: 'Kamis', date: '', time: '07.30 - 09.30', subject: '', time2: '', subject2: '' },
  { id: 'day_5', day: 'Jumat', date: '', time: '07.00 - 08.30', subject: '', time2: '', subject2: '' },
  { id: 'day_6', day: 'Sabtu', date: '', time: '07.30 - 09.30', subject: '', time2: '', subject2: '' },
];

/**
 * Format string tanggal YYYY-MM-DD ke format Indonesia (misal: 01 Des 2026 atau 1 Desember 2026)
 */
export function formatScheduleDateIndo(dateStr?: string, short = true): string {
  if (!dateStr || !dateStr.trim()) return '';
  
  // Jika sudah dalam format teks bebas (bukan YYYY-MM-DD)
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }

  try {
    const [year, month, day] = dateStr.split('-');
    const monthNamesShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const monthNamesLong = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      const mName = short ? monthNamesShort[mIdx] : monthNamesLong[mIdx];
      return `${day} ${mName} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Membersihkan dan memformat tanggal tanda tangan / titimangsa agar tidak muncul
 * format timestamp JavaScript mentah seperti "Sat Sep 26 2026 00:00:00 GMT+0700 (Waktu Indonesia Barat)"
 * dan mengubahnya menjadi format tanggal Indonesia sewajarnya (misal: "26 September 2026").
 */
export function formatReadableIndonesianDate(raw?: string | null): string {
  if (!raw || !raw.trim()) return '';
  const trimmed = raw.trim();

  const monthNamesLong = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // 1. Cek apakah ada format Date JS seperti "Sat Sep 26 2026 ... GMT+..." atau kata hari Inggris
  const isRawJsDate =
    /GMT[+-]\d{4}|(Waktu Indonesia|WIB|WITA|WIT)|^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+[A-Za-z]{3}\s+\d+/i.test(trimmed);
  const isIsoDate = /^\d{4}-\d{2}-\d{2}(T|\b)/.test(trimmed);

  if (isRawJsDate || isIsoDate) {
    try {
      const parsedDate = new Date(trimmed);
      if (!isNaN(parsedDate.getTime())) {
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = monthNamesLong[parsedDate.getMonth()];
        const year = parsedDate.getFullYear();
        return `${day} ${month} ${year}`;
      }
    } catch {
      // lanjut ke parser berikutnya
    }
  }

  // 2. Format YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const monthIdx = parseInt(ymdMatch[2], 10) - 1;
    const day = ymdMatch[3].padStart(2, '0');
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${monthNamesLong[monthIdx]} ${year}`;
    }
  }

  // 3. Format "DD/MM/YYYY" atau "DD-MM-YYYY"
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const monthIdx = parseInt(dmyMatch[2], 10) - 1;
    const year = dmyMatch[3];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${monthNamesLong[monthIdx]} ${year}`;
    }
  }

  // 4. Jika memuat nama bulan bahasa Inggris (misal "Sep 26, 2026")
  try {
    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100) {
      if (/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(trimmed)) {
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = monthNamesLong[parsedDate.getMonth()];
        const year = parsedDate.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
  } catch {
    // lanjut
  }

  return trimmed;
}

/**
 * Mengubah string scheduleInfo (bisa berupa JSON atau teks legacy) menjadi array ExamScheduleItem
 */
export function parseExamSchedule(raw?: string): ExamScheduleItem[] {
  if (!raw || !raw.trim()) {
    return createDefaultScheduleDays();
  }

  // 1. Coba parse JSON
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || `day_${idx + 1}_${Date.now()}`,
          day: item.day || DAYS_OF_WEEK[idx % 7] || 'Senin',
          date: item.date || '',
          time: item.time || '',
          subject: item.subject || item.mapel || item.jadwal || '',
          time2: item.time2 || '',
          subject2: item.subject2 || '',
        }));
      }
    }
  } catch (err) {
    console.warn('Gagal parse JSON scheduleInfo, fallback ke parser teks:', err);
  }

  // 2. Fallback parser teks baris demi baris (format lama)
  const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length > 0) {
    return lines.map((line, idx) => {
      // Contoh format lama: "Senin, 01 Des 2026: 07.30 - 09.30 (B. Indonesia)"
      const parts = line.split(':');
      const dayPart = parts[0]?.trim() || `Hari ${idx + 1}`;
      const rest = parts.slice(1).join(':').trim();

      const dayTokens = dayPart.split(',');
      const dayName = dayTokens[0]?.trim() || 'Senin';
      const dateText = dayTokens.slice(1).join(',').trim();

      return {
        id: `legacy_${idx + 1}`,
        day: dayName,
        date: dateText,
        time: '',
        subject: rest || line,
        time2: '',
        subject2: '',
      };
    });
  }

  return createDefaultScheduleDays();
}

/**
 * Mengubah array ExamScheduleItem menjadi string JSON yang rapi untuk disimpan di database/spreadsheet
 */
export function serializeExamSchedule(items: ExamScheduleItem[]): string {
  if (!items || items.length === 0) return '';
  
  // Hanya simpan item yang minimal memiliki hari, tanggal, atau mata pelajaran
  const activeItems = items.filter(
    (item) => item.day.trim() || item.date.trim() || item.subject.trim() || (item.subject2 && item.subject2.trim())
  );

  if (activeItems.length === 0) return '';

  return JSON.stringify(
    activeItems.map((it, idx) => ({
      id: it.id || `day_${idx + 1}`,
      day: it.day || 'Senin',
      date: it.date || '',
      time: it.time || '',
      subject: it.subject || '',
      ...(it.time2 || it.subject2
        ? {
            time2: it.time2 || '',
            subject2: it.subject2 || '',
          }
        : {}),
    }))
  );
}
