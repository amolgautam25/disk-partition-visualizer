import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDiskState from '../hooks/useDiskState';

const STORAGE_KEY = 'diskPartitionState';

beforeEach(() => {
  localStorage.clear();
});

describe('useDiskState — localStorage persistence', () => {
  it('loads defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useDiskState());
    expect(result.current.diskSizeValue).toBe('500');
    expect(result.current.diskSizeUnit).toBe('GB');
    expect(result.current.sectorSize).toBe(512);
    expect(result.current.partitions).toEqual([]);
  });

  it('saves state to localStorage when values change', () => {
    const { result } = renderHook(() => useDiskState());

    act(() => {
      result.current.setDiskSizeValue('1000');
    });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.diskSizeValue).toBe('1000');
  });

  it('restores state from localStorage on init', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        diskSizeValue: '256',
        diskSizeUnit: 'MB',
        sectorSize: 4096,
        partitions: [{ name: 'boot', startBlock: 0, endBlock: 100 }],
      })
    );

    const { result } = renderHook(() => useDiskState());
    expect(result.current.diskSizeValue).toBe('256');
    expect(result.current.diskSizeUnit).toBe('MB');
    expect(result.current.sectorSize).toBe(4096);
    expect(result.current.partitions).toHaveLength(1);
    expect(result.current.partitions[0].name).toBe('boot');
  });

  it('falls back to defaults when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json');
    const { result } = renderHook(() => useDiskState());
    expect(result.current.diskSizeValue).toBe('500');
    expect(result.current.partitions).toEqual([]);
  });

  it('persists partition additions', () => {
    const { result } = renderHook(() => useDiskState());
    const partition = { name: 'data', startBlock: 0, endBlock: 200 };

    act(() => {
      result.current.addPartition(partition);
    });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.partitions).toHaveLength(1);
    expect(saved.partitions[0].name).toBe('data');
  });
});
