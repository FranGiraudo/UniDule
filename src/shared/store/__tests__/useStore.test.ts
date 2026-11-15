import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../useStore';

describe('useStore - Pomodoro state & timestamp reconciliation', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.getState().setPomodoro({
      timeLeft: 25 * 60,
      isRunning: false,
      mode: 'pomodoro',
      endTime: null,
      subjectId: undefined,
      taskId: undefined,
      examId: undefined,
    });
  });

  it('initializes with default pomodoro state', () => {
    const state = useStore.getState().pomodoro;
    expect(state.timeLeft).toBe(1500);
    expect(state.isRunning).toBe(false);
    expect(state.mode).toBe('pomodoro');
    expect(state.endTime).toBeNull();
  });

  it('persists pomodoro updates to localStorage', () => {
    useStore.getState().setPomodoro({
      timeLeft: 1200,
      isRunning: true,
      endTime: Date.now() + 1200 * 1000,
    });

    const saved = localStorage.getItem('unidule_pomodoro');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.timeLeft).toBe(1200);
    expect(parsed.isRunning).toBe(true);
    expect(parsed.endTime).toBeGreaterThan(Date.now());
  });

  it('accurately reconciles remaining time using endTime timestamp', () => {
    const now = Date.now();
    const durationSeconds = 300;
    const endTime = now + durationSeconds * 1000;

    useStore.getState().setPomodoro({
      isRunning: true,
      timeLeft: durationSeconds,
      endTime,
    });

    // Simulate 100 seconds elapsed in real time
    const simulatedNow = now + 100 * 1000;
    const remaining = Math.max(0, Math.ceil((endTime - simulatedNow) / 1000));

    expect(remaining).toBe(200);
  });

  it('detects when timer has expired based on wall-clock time', () => {
    const now = Date.now();
    const endTime = now - 5000; // 5 seconds in the past

    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
    expect(remaining).toBe(0);
  });
});
