import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeImageProps {
  value: string;
  sizeMm?: number;
  className?: string;
}

export const QrCodeImage: React.FC<QrCodeImageProps> = ({
  value,
  sizeMm = 16,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 140,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [value]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm` }}
        className={`bg-neutral-100 border border-black flex items-center justify-center text-[8px] font-mono ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR ${value}`}
      style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm` }}
      className={`border border-black p-0.5 bg-white object-contain ${className}`}
    />
  );
};
