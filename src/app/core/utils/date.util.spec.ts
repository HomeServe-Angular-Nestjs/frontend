import { minutesToTime, timeToMinutes, formatDateToYMD } from './date.util';

describe('date.util — time helpers (S6/S32 support)', () => {
  it('parses HH:mm', () => {
    expect(timeToMinutes('10:00')).toBe(600);
    expect(timeToMinutes('23:50')).toBe(1430);
  });

  it('tolerates HH:mm:ss by dropping seconds', () => {
    expect(timeToMinutes('10:00:30')).toBe(600);
  });

  it('accepts out-of-range "24:00" / "25:00" shells produced by the suggestion logic', () => {
    expect(timeToMinutes('24:00')).toBe(1440);
    expect(timeToMinutes('25:00')).toBe(1500);
  });

  it('formats minutes back to time, including overflow values', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(675)).toBe('11:15');
    expect(minutesToTime(1440)).toBe('24:00'); // <-- beyond-day value leaks into payloads
    expect(minutesToTime(1500)).toBe('25:00');
  });

  it('round-trips normal values', () => {
    expect(minutesToTime(timeToMinutes('09:00'))).toBe('09:00');
    expect(minutesToTime(timeToMinutes('17:00'))).toBe('17:00');
  });

  it('is the only place validating day boundaries — yields YYYY-MM-DD for ISO input', () => {
    expect(formatDateToYMD('2026-08-15T00:00:00.000Z')).toBe('2026-08-15');
  });
});