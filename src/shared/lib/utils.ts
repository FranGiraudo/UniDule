export const t2m = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const m2t = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const t2y = (t: string, start: string, ppm: number) => (t2m(t) - t2m(start)) * ppm;
export const dur = (s: string, e: string, ppm: number) => (t2m(e) - t2m(s)) * ppm;

export function todayDay(): string | null {
  return (
    [null, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', null][new Date().getDay()] || null
  );
}

export function nowMin(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export function formatDate(ds?: string | null): string {
  if (!ds) return 'Sin fecha';
  return new Date(ds + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(ds?: string | null): number | null {
  if (!ds) return null;
  return Math.ceil((new Date(ds + 'T12:00:00').getTime() - new Date().getTime()) / 86400000);
}

export function urgColor(d: number | null): string {
  if (d === null) return 'var(--text2)';
  if (d < 0 || d <= 2) return '#f87171';
  if (d <= 7) return '#fb923c';
  if (d <= 14) return '#fbbf24';
  return '#34d399';
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes HTML-significant characters so untrusted strings are safe to interpolate into raw HTML (e.g. document.write). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playTone(523.25, 0, 0.4);
    playTone(659.25, 0.2, 0.6);
  } catch (e) {
    console.error('Audio play failed', e);
  }
};
