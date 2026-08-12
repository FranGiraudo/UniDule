import { describe, expect, it } from 'vitest';
import { daysUntil, formatDate, m2t, t2m, urgColor } from '../utils';

describe('t2m / m2t', () => {
  it('converts HH:MM to minutes and back', () => {
    expect(t2m('01:30')).toBe(90);
    expect(m2t(90)).toBe('01:30');
  });
});

describe('formatDate', () => {
  it('returns fallback text for missing dates', () => {
    expect(formatDate(null)).toBe('Sin fecha');
    expect(formatDate(undefined)).toBe('Sin fecha');
  });

  it('formats a date string in es-AR', () => {
    expect(formatDate('2026-08-11')).toMatch(/2026/);
  });
});

describe('daysUntil', () => {
  it('returns null when there is no date', () => {
    expect(daysUntil(null)).toBeNull();
  });
});

describe('urgColor', () => {
  it('returns the neutral color when days is null', () => {
    expect(urgColor(null)).toBe('var(--text2)');
  });

  it('returns red for overdue or near-due items', () => {
    expect(urgColor(-1)).toBe('#f87171');
    expect(urgColor(2)).toBe('#f87171');
  });

  it('returns green for far-away deadlines', () => {
    expect(urgColor(30)).toBe('#34d399');
  });
});
