import * as XLSX from 'xlsx';
import {
  Student,
  Gender,
  ImportValidationResult,
  ImportValidationRow,
  Teacher,
  TeacherImportValidationResult,
  TeacherImportValidationRow,
} from '../types';

/**
 * Generates and downloads an Excel template for Students with Agama column.
 */
export const downloadExcelTemplate = (): void => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data
  const sampleData = [
    {
      'No': 1,
      'NISN': '0123456781',
      'NIS': '2023001',
      'Nama Lengkap': 'Ahmad Fauzi Pratama',
      'Jenis Kelamin (L/P)': 'L',
      'Agama': 'Islam',
      'Kelas': 'Kelas 6A',
      'Tempat Lahir': 'Kediri',
      'Tanggal Lahir (YYYY-MM-DD)': '2014-05-12',
      'Ruang Ujian': 'Ruang 01',
      'Nomor Meja': '01',
    },
    {
      'No': 2,
      'NISN': '0123456782',
      'NIS': '2023002',
      'Nama Lengkap': 'Dewi Ayu Sekartaji',
      'Jenis Kelamin (L/P)': 'P',
      'Agama': 'Islam',
      'Kelas': 'Kelas 6A',
      'Tempat Lahir': 'Kediri',
      'Tanggal Lahir (YYYY-MM-DD)': '2014-08-20',
      'Ruang Ujian': 'Ruang 01',
      'Nomor Meja': '02',
    },
    {
      'No': 3,
      'NISN': '0123456783',
      'NIS': '2023003',
      'Nama Lengkap': 'Maria Theresa Putri',
      'Jenis Kelamin (L/P)': 'P',
      'Agama': 'Kristen',
      'Kelas': 'Kelas 6B',
      'Tempat Lahir': 'Malang',
      'Tanggal Lahir (YYYY-MM-DD)': '2014-02-17',
      'Ruang Ujian': 'Ruang 02',
      'Nomor Meja': '01',
    },
  ];

  const wsData = XLSX.utils.json_to_sheet(sampleData);

  wsData['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // NISN
    { wch: 12 }, // NIS
    { wch: 30 }, // Nama Lengkap
    { wch: 20 }, // Jenis Kelamin
    { wch: 15 }, // Agama
    { wch: 12 }, // Kelas
    { wch: 18 }, // Tempat Lahir
    { wch: 25 }, // Tanggal Lahir
    { wch: 15 }, // Ruang Ujian
    { wch: 14 }, // Nomor Meja
  ];

  // Sheet 2: Petunjuk Pengisian
  const instructions = [
    ['PETUNJUK PENGISIAN TEMPLATE DATA SISWA PORTAL ASESMEN'],
    [''],
    ['1. Kolom "Nama Lengkap": Wajib diisi. Tuliskan nama lengkap siswa.'],
    ['2. Kolom "Jenis Kelamin": Isi dengan huruf "L" untuk Laki-laki atau "P" untuk Perempuan.'],
    ['3. Kolom "Agama": Isi dengan Islam, Kristen, Katolik, Hindu, Buddha, atau Konghucu.'],
    ['   * Catatan: Untuk siswa perempuan, agama Islam menggunakan avatar Hijab, selain Islam menggunakan avatar Rambut Kepang Terurai.'],
    ['4. Kolom "NISN": Nomor Induk Siswa Nasional (10 digit angka). Usahakan unik.'],
    ['5. Kolom "NIS": Nomor Induk Siswa lokal sekolah.'],
    ['6. Kolom "Kelas": Contoh: Kelas 6A, Kelas 5B, dsb.'],
    ['7. Kolom "Tanggal Lahir": Gunakan format YYYY-MM-DD (Contoh: 2014-05-12) agar seragam.'],
    ['8. Foto siswa tidak dimasukkan ke dalam Excel. Unggah terpisah via menu Upload Foto Massal ZIP.'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 90 }];

  XLSX.utils.book_append_sheet(wb, wsData, 'DATA SISWA');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'PETUNJUK');

  XLSX.writeFile(wb, 'Template_Data_Siswa_Portal_Ujian.xlsx');
};

/**
 * Parses an Excel or CSV file buffer and validates the student records.
 */
export const parseAndValidateExcel = async (
  file: File,
  existingStudents: Student[] = []
): Promise<ImportValidationResult> => {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  const sheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('siswa')) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];

  if (!sheet) {
    throw new Error('Lembar kerja (sheet) tidak ditemukan dalam file Excel.');
  }

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('File Excel tidak memiliki baris data.');
  }

  const existingNisns = new Set(existingStudents.map((s) => s.nisn.trim().toLowerCase()));
  const seenNisnsInFile = new Set<string>();

  const validatedRows: ImportValidationRow[] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const errors: string[] = [];
    const warnings: string[] = [];

    const findValue = (possibleHeaders: string[]): string => {
      for (const [key, val] of Object.entries(row)) {
        const cleanKey = key.trim().toLowerCase();
        for (const target of possibleHeaders) {
          if (cleanKey === target.toLowerCase() || cleanKey.includes(target.toLowerCase())) {
            if (val instanceof Date) {
              return val.toISOString().split('T')[0];
            }
            return String(val).trim();
          }
        }
      }
      return '';
    };

    const name = findValue(['Nama Lengkap', 'Nama Siswa', 'Nama Peserta', 'Nama']);
    const rawGender = findValue(['Jenis Kelamin', 'Gender', 'JK', 'Sex', 'L/P']);
    const rawReligion = findValue(['Agama', 'Kepercayaan', 'Religion']);
    const nisn = findValue(['NISN', 'Nomor Induk Siswa Nasional']);
    const nis = findValue(['NIS', 'Nomor Induk', 'NIPD']);
    const className = findValue(['Kelas', 'Rombel', 'Class']) || 'Kelas 6';
    const birthPlace = findValue(['Tempat Lahir', 'Tempat']);
    let birthDate = findValue(['Tanggal Lahir', 'Tgl Lahir', 'TTL', 'Birth Date']);
    const examRoom = findValue(['Ruang Ujian', 'Ruang', 'Room']);
    const examSeat = findValue(['Nomor Meja', 'No Meja', 'Meja', 'Seat', 'No Peserta']);

    // 1. Name Validation
    if (!name) {
      errors.push('Nama Lengkap wajib diisi');
    }

    // 2. Gender Normalization
    let gender: Gender = 'L';
    const cleanGender = rawGender.toUpperCase();
    if (cleanGender.startsWith('P') || cleanGender.includes('PEREMPUAN') || cleanGender.includes('WANITA')) {
      gender = 'P';
    } else if (cleanGender.startsWith('L') || cleanGender.includes('LAKI') || cleanGender.includes('PRIA')) {
      gender = 'L';
    } else if (rawGender) {
      warnings.push(`Jenis kelamin "${rawGender}" dinormalisasi menjadi Laki-laki`);
    } else {
      warnings.push('Jenis kelamin kosong, default menjadi Laki-laki');
    }

    // 3. Religion Normalization
    let religion = 'Islam';
    if (rawReligion) {
      const rLower = rawReligion.toLowerCase();
      if (rLower.includes('kristen') || rLower.includes('protestan')) religion = 'Kristen';
      else if (rLower.includes('katolik')) religion = 'Katolik';
      else if (rLower.includes('hindu')) religion = 'Hindu';
      else if (rLower.includes('buddha') || rLower.includes('budha')) religion = 'Buddha';
      else if (rLower.includes('konghucu') || rLower.includes('khonghucu')) religion = 'Konghucu';
      else if (rLower.includes('islam')) religion = 'Islam';
      else religion = rawReligion;
    }

    // 4. NISN Validation
    if (!nisn) {
      warnings.push('NISN belum diisi');
    } else {
      const cleanNisn = nisn.toLowerCase();
      if (seenNisnsInFile.has(cleanNisn)) {
        errors.push(`NISN ${nisn} duplikat di dalam file import ini`);
      } else if (existingNisns.has(cleanNisn)) {
        warnings.push(`NISN ${nisn} sudah terdaftar di sistem (akan diperbarui)`);
      }
      seenNisnsInFile.add(cleanNisn);
    }

    // 5. Date Normalization
    if (birthDate) {
      const parts = birthDate.split(/[/.-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          birthDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
      if (warnings.length > 0) warningCount++;
    } else {
      errorCount++;
    }

    const studentData: Partial<Student> = {
      name,
      gender,
      religion,
      nisn: nisn || `GEN-${Date.now()}-${idx}`,
      nis: nis || '',
      className,
      birthPlace,
      birthDate,
      examRoom: examRoom || 'Ruang 01',
      examSeat: examSeat || String(idx + 1).padStart(2, '0'),
    };

    validatedRows.push({
      rowNumber,
      data: studentData,
      isValid,
      warnings,
      errors,
    });
  });

  return {
    totalRows: rawRows.length,
    validCount,
    warningCount,
    errorCount,
    rows: validatedRows,
  };
};

/**
 * Generates and downloads an Excel template for Teachers (Data Guru).
 */
export const downloadTeacherExcelTemplate = (): void => {
  const wb = XLSX.utils.book_new();

  const sampleTeachers = [
    {
      'No': 1,
      'NIP': '19780512 200501 1 008',
      'Nama Lengkap & Gelar': 'Drs. Bambang Suryono, M.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Agama': 'Islam',
      'Mata Pelajaran / Jabatan': 'Matematika',
      'Status Tugas': 'Pengawas Ruang',
      'Ruang Ujian': 'Ruang 01',
      'No. HP / WhatsApp': '081234567890',
      'Email': 'bambang@sekolah.sch.id',
    },
    {
      'No': 2,
      'NIP': '19820315 200801 2 012',
      'Nama Lengkap & Gelar': 'Siti Rahmawati, S.Pd.',
      'Jenis Kelamin (L/P)': 'P',
      'Agama': 'Islam',
      'Mata Pelajaran / Jabatan': 'Bahasa Indonesia',
      'Status Tugas': 'Pengawas Ruang',
      'Ruang Ujian': 'Ruang 02',
      'No. HP / WhatsApp': '081234567891',
      'Email': 'siti.rahma@sekolah.sch.id',
    },
    {
      'No': 3,
      'NIP': '19901104 201502 2 003',
      'Nama Lengkap & Gelar': 'Maria Christina, S.Si.',
      'Jenis Kelamin (L/P)': 'P',
      'Agama': 'Katolik',
      'Mata Pelajaran / Jabatan': 'Ilmu Pengetahuan Alam (IPA)',
      'Status Tugas': 'Panitia Ujian',
      'Ruang Ujian': 'Ruang Panitia',
      'No. HP / WhatsApp': '081234567892',
      'Email': 'maria.c@sekolah.sch.id',
    },
  ];

  const wsData = XLSX.utils.json_to_sheet(sampleTeachers);
  wsData['!cols'] = [
    { wch: 6 },  // No
    { wch: 24 }, // NIP
    { wch: 32 }, // Nama Lengkap
    { wch: 20 }, // Jenis Kelamin
    { wch: 15 }, // Agama
    { wch: 26 }, // Mapel/Jabatan
    { wch: 18 }, // Status Tugas
    { wch: 16 }, // Ruang Ujian
    { wch: 18 }, // No HP
    { wch: 26 }, // Email
  ];

  const instructions = [
    ['PETUNJUK PENGISIAN TEMPLATE DATA GURU & PENGAWAS UJIAN'],
    [''],
    ['1. Kolom "Nama Lengkap & Gelar": Wajib diisi (Contoh: Drs. Bambang Suryono, M.Pd).'],
    ['2. Kolom "NIP": Nomor Induk Pegawai atau NUPTK. Isi tanda strip (-) bila belum memiliki NIP.'],
    ['3. Kolom "Jenis Kelamin": Isi "L" untuk Laki-laki atau "P" untuk Perempuan.'],
    ['4. Kolom "Agama": Islam, Kristen, Katolik, Hindu, Buddha, atau Konghucu.'],
    ['5. Kolom "Mata Pelajaran / Jabatan": Contoh: Guru Matematika, Guru Kelas, Kurikulum, dll.'],
    ['6. Kolom "Status Tugas": Pilih antara "Pengawas Ruang", "Panitia Ujian", "Guru", atau "Wali Kelas".'],
    ['7. Kolom "Ruang Ujian": Ruang yang diawasi (misal Ruang 01, Ruang 02) untuk dicetak pada ID Pengawas.'],
    ['8. Kolom "No. HP / WhatsApp": Nomor kontak aktif untuk koordinasi pelaksanaan asesmen.'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 90 }];

  XLSX.utils.book_append_sheet(wb, wsData, 'DATA GURU');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'PETUNJUK');

  XLSX.writeFile(wb, 'Template_Data_Guru_Portal_Ujian.xlsx');
};

/**
 * Parses and validates Teacher Excel / CSV file
 */
export const parseAndValidateTeacherExcel = async (
  file: File,
  existingTeachers: Teacher[] = []
): Promise<TeacherImportValidationResult> => {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const sheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('guru')) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];

  if (!sheet) {
    throw new Error('Lembar kerja (sheet) tidak ditemukan dalam file Excel.');
  }

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('File Excel tidak memiliki baris data guru.');
  }

  const existingNips = new Set(
    existingTeachers.map((t) => t.nip.replace(/\s+/g, '').toLowerCase()).filter((n) => n && n !== '-')
  );
  const seenNisInFile = new Set<string>();

  const validatedRows: TeacherImportValidationRow[] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const errors: string[] = [];
    const warnings: string[] = [];

    const findValue = (possibleHeaders: string[]): string => {
      for (const [key, val] of Object.entries(row)) {
        const cleanKey = key.trim().toLowerCase();
        for (const target of possibleHeaders) {
          if (cleanKey === target.toLowerCase() || cleanKey.includes(target.toLowerCase())) {
            return String(val).trim();
          }
        }
      }
      return '';
    };

    const name = findValue(['Nama Lengkap', 'Nama Guru', 'Nama', 'Gelar']);
    const nip = findValue(['NIP', 'NUPTK', 'Nomor Induk Pegawai']);
    const rawGender = findValue(['Jenis Kelamin', 'Gender', 'JK', 'Sex', 'L/P']);
    const rawReligion = findValue(['Agama', 'Religion']);
    const subject = findValue(['Mata Pelajaran', 'Mapel', 'Jabatan', 'Tugas']) || 'Guru Mata Pelajaran';
    const statusTugas = findValue(['Status Tugas', 'Status', 'Peran', 'Penugasan']);
    const roomDuty = findValue(['Ruang Ujian', 'Ruang', 'Ruang Tugas', 'Jaga Ruang']) || 'Ruang 01';
    const phone = findValue(['No. HP', 'WhatsApp', 'No HP', 'Telepon', 'Telp']);
    const email = findValue(['Email', 'Surel']);

    // Validation
    if (!name) {
      errors.push('Nama Guru / Pengawas wajib diisi');
    }

    let gender: Gender = 'L';
    const cleanGender = rawGender.toUpperCase();
    if (cleanGender.startsWith('P') || cleanGender.includes('PEREMPUAN') || cleanGender.includes('WANITA')) {
      gender = 'P';
    } else if (cleanGender.startsWith('L') || cleanGender.includes('LAKI') || cleanGender.includes('PRIA')) {
      gender = 'L';
    }

    let religion = 'Islam';
    if (rawReligion) {
      const rLower = rawReligion.toLowerCase();
      if (rLower.includes('kristen') || rLower.includes('protestan')) religion = 'Kristen';
      else if (rLower.includes('katolik')) religion = 'Katolik';
      else if (rLower.includes('hindu')) religion = 'Hindu';
      else if (rLower.includes('buddha') || rLower.includes('budha')) religion = 'Buddha';
      else if (rLower.includes('konghucu')) religion = 'Konghucu';
      else if (rLower.includes('islam')) religion = 'Islam';
      else religion = rawReligion;
    }

    if (nip && nip !== '-') {
      const cleanNip = nip.replace(/\s+/g, '').toLowerCase();
      if (seenNisInFile.has(cleanNip)) {
        errors.push(`NIP ${nip} duplikat di file import ini`);
      } else if (existingNips.has(cleanNip)) {
        warnings.push(`NIP ${nip} sudah ada di sistem (akan diperbarui)`);
      }
      seenNisInFile.add(cleanNip);
    } else {
      warnings.push('NIP tidak diisi (Non-PNS / Honorer)');
    }

    let roleType: Teacher['roleType'] = 'pengawas';
    const sLower = statusTugas.toLowerCase();
    if (sLower.includes('panitia')) roleType = 'panitia';
    else if (sLower.includes('wali')) roleType = 'wali_kelas';
    else if (sLower.includes('pengawas')) roleType = 'pengawas';
    else if (sLower.includes('guru')) roleType = 'guru';

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
      if (warnings.length > 0) warningCount++;
    } else {
      errorCount++;
    }

    const teacherData: Partial<Teacher> = {
      name,
      nip: nip || '-',
      gender,
      religion,
      subject,
      roleType,
      roomDuty,
      phone,
      email,
    };

    validatedRows.push({
      rowNumber,
      data: teacherData,
      isValid,
      warnings,
      errors,
    });
  });

  return {
    totalRows: rawRows.length,
    validCount,
    warningCount,
    errorCount,
    rows: validatedRows,
  };
};
