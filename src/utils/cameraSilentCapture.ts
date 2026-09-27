/**
 * Helper pengambilan foto silent (tanpa kotak preview kamera di layar)
 * Langsung memotret dari webcam/kamera depan dan mengembalikan base64 data URL
 */

export async function captureSilentPhoto(): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      success: false,
      error: 'Browser tidak mendukung akses kamera langsung.',
    };
  }

  let stream: MediaStream | null = null;
  try {
    // 1. Dapatkan akses kamera (utamakan kamera depan/user)
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    // 2. Buat elemen video invisible di memori (tidak di-mount ke DOM)
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;

    // 3. Tunggu video siap merender frame
    await new Promise<void>((resolve, reject) => {
      let isResolved = false;

      video.onloadedmetadata = () => {
        video
          .play()
          .then(() => {
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          })
          .catch((err) => {
            if (!isResolved) {
              isResolved = true;
              reject(err);
            }
          });
      };

      // Fallback timeout jika metadata lambat
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      }, 1200);
    });

    // Berikan jeda 250ms agar auto-exposure sensor kamera menyesuaikan cahaya ruangan
    await new Promise((r) => setTimeout(r, 250));

    // 4. Salin frame kamera ke Canvas
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Gagal menginisialisasi canvas rendering.');
    }

    ctx.drawImage(video, 0, 0, width, height);

    // 5. Konversi ke JPEG base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // 6. Matikan seluruh track kamera segera agar indikator hardware kamera padam
    stream.getTracks().forEach((track) => track.stop());

    return {
      success: true,
      dataUrl,
    };
  } catch (err: unknown) {
    if (stream) {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
    }
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errMsg,
    };
  }
}
