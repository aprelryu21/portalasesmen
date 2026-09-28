import React, { useState, useEffect } from 'react';

interface SchoolLogoProps {
  url?: string;
  name: string;
  sizeMm?: number;
  className?: string;
}

export const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return '';
  if (trimmed.startsWith('data:image/')) return trimmed;

  // 1. Google User Content /d/ID
  const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) {
    return `https://drive.google.com/thumbnail?id=${lh3Match[1]}&sz=w1000`;
  }

  // 2. Google Drive /file/d/ID
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1000`;
  }

  // 3. Google Drive ?id=ID or &id=ID
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1000`;
  }

  // 4. Raw Google Drive file ID
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w1000`;
  }

  return trimmed;
};

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  url,
  name,
  sizeMm = 14,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const normalizedSrc = normalizeImageUrl(url);

  // Extract ID if Google Drive for fallback attempt
  const driveIdMatch = url ? url.match(/([a-zA-Z0-9_-]{25,45})/) : null;
  const driveId = driveIdMatch ? driveIdMatch[1] : null;

  useEffect(() => {
    setImgError(false);
    setUseFallback(false);
  }, [url]);

  const handleImageError = () => {
    if (!useFallback && driveId) {
      setUseFallback(true);
    } else {
      setImgError(true);
    }
  };

  const currentSrc = useFallback && driveId
    ? `https://lh3.googleusercontent.com/d/${driveId}`
    : normalizedSrc;

  if (currentSrc && !imgError) {
    return (
      <img
        src={currentSrc}
        alt={`Logo ${name}`}
        onError={handleImageError}
        style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm` }}
        className={`object-contain ${className}`}
      />
    );
  }

  // Indonesian School Emblem vector placeholder (Tut Wuri Handayani inspired / Education Flame)
  return (
    <div
      style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm` }}
      className={`relative flex items-center justify-center bg-blue-700 text-white rounded-full border-[1.5px] border-black p-0.5 shadow-sm overflow-hidden flex-shrink-0 ${className}`}
      title={name}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Five-sided star / pentagon shield */}
        <polygon points="50,6 94,36 78,90 22,90 6,36" fill="#1D4ED8" stroke="#FDE047" strokeWidth="4" />
        {/* Center Flame / Torch */}
        <path d="M50 20 C42 32 38 42 42 56 C45 62 50 64 50 64 C50 64 55 62 58 56 C62 42 58 32 50 20 Z" fill="#FACC15" />
        <path d="M50 28 C45 36 44 42 46 50 C48 54 50 55 50 55 C50 55 52 54 54 50 C56 42 55 36 50 28 Z" fill="#EF4444" />
        {/* Open Book */}
        <path d="M26 66 Q50 60 50 78 Q50 60 74 66 L72 82 Q50 76 50 90 Q50 76 28 82 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
        {/* Rays */}
        <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
