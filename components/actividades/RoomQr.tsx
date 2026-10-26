'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function RoomQr({ url, size = 280 }: { url: string; size?: number }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: { dark: '#071F5E', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then((data) => {
      if (!cancelled) setSrc(data);
    });
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (!src) {
    return <div className="mx-auto animate-pulse rounded-2xl bg-[#EEF3F7]" style={{ width: size, height: size }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Código QR de la sala" width={size} height={size} className="mx-auto rounded-2xl bg-white" />
  );
}
