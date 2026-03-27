import { describe, it, expect } from 'vitest';
import { formatSize, formatBlocks } from '../utils/format';

describe('formatSize', () => {
  it('formats bytes', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(512)).toBe('512 B');
    expect(formatSize(999)).toBe('999 B');
  });

  it('formats kilobytes', () => {
    expect(formatSize(1000)).toBe('1.00 KB');
    expect(formatSize(1500)).toBe('1.50 KB');
  });

  it('formats megabytes', () => {
    expect(formatSize(1e6)).toBe('1.00 MB');
    expect(formatSize(5.5e6)).toBe('5.50 MB');
  });

  it('formats gigabytes', () => {
    expect(formatSize(1e9)).toBe('1.00 GB');
    expect(formatSize(500e9)).toBe('500.00 GB');
  });

  it('formats terabytes', () => {
    expect(formatSize(1e12)).toBe('1.00 TB');
    expect(formatSize(2.5e12)).toBe('2.50 TB');
  });
});

describe('formatBlocks', () => {
  it('formats small numbers directly', () => {
    expect(formatBlocks(0)).toBe('0');
    expect(formatBlocks(100)).toBe('100');
    expect(formatBlocks(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatBlocks(1000)).toBe('1.0K');
    expect(formatBlocks(2048)).toBe('2.0K');
    expect(formatBlocks(999999)).toBe('1000.0K');
  });

  it('formats millions with M suffix', () => {
    expect(formatBlocks(1000000)).toBe('1.0M');
    expect(formatBlocks(976773134)).toBe('976.8M');
  });
});
