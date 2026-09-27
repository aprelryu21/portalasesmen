/**
 * Helper deteksi nama browser, versi, dan sistem operasi pengguna
 */

export function detectBrowserInfo(): string {
  if (typeof window === 'undefined' || !navigator) {
    return 'Web Browser (Unknown)';
  }

  const ua = navigator.userAgent;
  let browserName = 'Browser Standar';
  let browserVersion = '';
  let osName = 'Perangkat';

  // Detect OS
  if (/Windows NT 10.0/i.test(ua)) osName = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) osName = 'Windows 8.1';
  else if (/Windows NT 6.2/i.test(ua)) osName = 'Windows 8';
  else if (/Windows NT 6.1/i.test(ua)) osName = 'Windows 7';
  else if (/Android/i.test(ua)) osName = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) osName = 'iOS';
  else if (/Mac OS X/i.test(ua)) osName = 'macOS';
  else if (/Linux/i.test(ua)) osName = 'Linux';
  else if (/CrOS/i.test(ua)) osName = 'ChromeOS';

  // Detect Browser & Version
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browserName = 'Microsoft Edge';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/OPR\/([0-9.]+)/i.test(ua) || /Opera/i.test(ua)) {
    browserName = 'Opera';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    browserName = 'Samsung Internet';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browserName = 'Google Chrome';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browserName = 'Mozilla Firefox';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    browserName = 'Apple Safari';
    browserVersion = RegExp.$1.split('.')[0];
  } else if (/Safari/i.test(ua)) {
    browserName = 'Safari';
  }

  const verStr = browserVersion ? ` v${browserVersion}` : '';
  return `${browserName}${verStr} (${osName})`;
}

/**
 * Format timestamp ke format bahasa Indonesia yang mudah dibaca
 */
export function formatLoginTime(isoOrDateString?: string): string {
  if (!isoOrDateString) return '-';
  try {
    const d = new Date(isoOrDateString);
    if (isNaN(d.getTime())) return isoOrDateString;

    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB';
  } catch {
    return isoOrDateString;
  }
}
