import JSZip from 'jszip';
import { Student } from '../types';

export interface PhotoMatchResult {
  totalPhotosFound: number;
  matchedCount: number;
  unmatchedCount: number;
  unmatchedFiles: string[];
  matchedMap: Record<string, string>; // studentId -> dataUrl
  matchedDetails: {
    studentId: string;
    studentName: string;
    nisn: string;
    matchedFileName: string;
    matchedBy: 'NISN' | 'NIS' | 'NAMA';
    dataUrl: string;
  }[];
}

// Convert a Blob/File to Data URL base64 string
export const fileToDataUrl = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const cleanString = (str: string): string => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Matches extracted image files with student records based on NISN, NIS, or Student Name.
 */
export const processAndMatchPhotos = async (
  files: { name: string; blob: Blob }[],
  students: Student[]
): Promise<PhotoMatchResult> => {
  const matchedMap: Record<string, string> = {};
  const matchedDetails: PhotoMatchResult['matchedDetails'] = [];
  const unmatchedFiles: string[] = [];

  // Index students for fast matching
  const nisnMap = new Map<string, Student>();
  const nisMap = new Map<string, Student>();
  const nameMap = new Map<string, Student>();

  for (const student of students) {
    if (!student) continue;
    if (student.nisn) {
      nisnMap.set(cleanString(student.nisn), student);
    }
    if (student.nis) {
      nisMap.set(cleanString(student.nis), student);
    }
    if (student.name) {
      nameMap.set(cleanString(student.name), student);
    }
  }

  for (const { name: fileName, blob } of files) {
    // Strip file extension: e.g. "0012345678.jpg" -> "0012345678"
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const cleanBase = cleanString(baseName);

    let matchedStudent: Student | undefined;
    let matchedBy: 'NISN' | 'NIS' | 'NAMA' = 'NISN';

    // 1. Try NISN Match
    if (nisnMap.has(cleanBase)) {
      matchedStudent = nisnMap.get(cleanBase);
      matchedBy = 'NISN';
    } else {
      // Check partial or contains (e.g. "foto_0012345678")
      for (const [key, std] of nisnMap.entries()) {
        if (key.length >= 6 && cleanBase.includes(key)) {
          matchedStudent = std;
          matchedBy = 'NISN';
          break;
        }
      }
    }

    // 2. Try NIS Match
    if (!matchedStudent && nisMap.has(cleanBase)) {
      matchedStudent = nisMap.get(cleanBase);
      matchedBy = 'NIS';
    }

    // 3. Try Name Match
    if (!matchedStudent) {
      if (nameMap.has(cleanBase)) {
        matchedStudent = nameMap.get(cleanBase);
        matchedBy = 'NAMA';
      } else {
        for (const [key, std] of nameMap.entries()) {
          if (key.length >= 5 && (cleanBase.includes(key) || key.includes(cleanBase))) {
            matchedStudent = std;
            matchedBy = 'NAMA';
            break;
          }
        }
      }
    }

    if (matchedStudent) {
      const dataUrl = await fileToDataUrl(blob);
      matchedMap[matchedStudent.id] = dataUrl;
      matchedDetails.push({
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        nisn: matchedStudent.nisn,
        matchedFileName: fileName,
        matchedBy,
        dataUrl,
      });
    } else {
      unmatchedFiles.push(fileName);
    }
  }

  return {
    totalPhotosFound: files.length,
    matchedCount: Object.keys(matchedMap).length,
    unmatchedCount: unmatchedFiles.length,
    unmatchedFiles,
    matchedMap,
    matchedDetails,
  };
};

/**
 * Handles ZIP file extraction and processes images inside.
 */
export const extractAndMatchFromZip = async (
  zipFile: File,
  students: Student[]
): Promise<PhotoMatchResult> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  const imageFiles: { name: string; blob: Blob }[] = [];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  for (const [relativePath, fileObj] of Object.entries(loadedZip.files)) {
    if (fileObj.dir) continue;
    // Skip hidden files / macOS __MACOSX metadata
    if (relativePath.startsWith('__MACOSX/') || relativePath.startsWith('.')) continue;

    const lowerName = relativePath.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (hasValidExt) {
      const blob = await fileObj.async('blob');
      const simpleName = relativePath.split('/').pop() || relativePath;
      imageFiles.push({ name: simpleName, blob });
    }
  }

  return processAndMatchPhotos(imageFiles, students);
};
