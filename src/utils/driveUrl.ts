/**
 * Helper utility to normalize and handle Google Drive image & file URLs
 */

export const extractDriveFileId = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:image/')) return null;

  // Pattern 1: /file/d/ID
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchFile && matchFile[1]) return matchFile[1];

  // Pattern 2: [?&]id=ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (matchId && matchId[1]) return matchId[1];

  // Pattern 3: /d/ID
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 4: Raw file ID
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
};

export const getDriveThumbnailUrl = (url?: string, size = 1000): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }
  return trimmed;
};

export const getDriveAlternativeImageUrl = (url?: string, size = 1000): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
  }
  return trimmed;
};

export const getDriveViewerUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return trimmed;
};
