import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import useDiskState from '../hooks/useDiskState';
import App from '../App';

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

describe('useDiskState — reset', () => {
  it('restores default values after reset', () => {
    const { result } = renderHook(() =>
      useDiskState({ diskSize: '500', diskUnit: 'GB', sectorSize: 512, partitions: [] })
    );

    act(() => {
      result.current.addPartition({ name: 'tmp', startBlock: 0, endBlock: 100 });
      result.current.setDiskSizeValue('1000');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.diskSizeValue).toBe('500');
    expect(result.current.diskSizeUnit).toBe('GB');
    expect(result.current.sectorSize).toBe(512);
    expect(result.current.partitions).toEqual([]);
  });

  it('clears localStorage on reset', () => {
    const { result } = renderHook(() => useDiskState());

    act(() => {
      result.current.addPartition({ name: 'tmp', startBlock: 0, endBlock: 100 });
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).partitions).toHaveLength(1);

    act(() => {
      result.current.reset();
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).partitions).toEqual([]);
  });
});

describe('useDiskState — setTotalBlocks', () => {
  it('updates diskSizeValue and auto-selects the best unit', () => {
    const { result } = renderHook(() =>
      useDiskState({ diskSize: '500', diskUnit: 'GB', sectorSize: 512, partitions: [] })
    );

    act(() => {
      // 1,000,000 blocks * 512 B = 512,000,000 B = 512 MB
      result.current.setTotalBlocks(1_000_000);
    });

    expect(result.current.diskSizeUnit).toBe('MB');
    expect(result.current.diskSizeValue).toBe('512');
    expect(result.current.totalBlocks).toBe(1_000_000);
  });

  it('uses B unit for very small block counts', () => {
    const { result } = renderHook(() =>
      useDiskState({ diskSize: '500', diskUnit: 'GB', sectorSize: 512, partitions: [] })
    );

    act(() => {
      // 1 block * 512 B = 512 B
      result.current.setTotalBlocks(1);
    });

    expect(result.current.diskSizeUnit).toBe('B');
    expect(result.current.diskSizeValue).toBe('512');
  });

  it('does nothing for invalid input', () => {
    const { result } = renderHook(() =>
      useDiskState({ diskSize: '500', diskUnit: 'GB', sectorSize: 512, partitions: [] })
    );
    const before = result.current.diskSizeValue;

    act(() => { result.current.setTotalBlocks('abc'); });
    expect(result.current.diskSizeValue).toBe(before);

    act(() => { result.current.setTotalBlocks(-1); });
    expect(result.current.diskSizeValue).toBe(before);
  });

  it('keeps two-way sync: disk size change updates totalBlocks', () => {
    const { result } = renderHook(() =>
      useDiskState({ diskSize: '1', diskUnit: 'GB', sectorSize: 512, partitions: [] })
    );

    act(() => { result.current.setDiskSizeValue('2'); });
    // 2 GB / 512 B = 3,906,250 blocks
    expect(result.current.totalBlocks).toBe(3_906_250);
  });
});

describe('Reset button UI', () => {
  it('shows a Reset button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('opens a confirmation dialog when Reset is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    expect(screen.getByText(/reset all data/i)).toBeInTheDocument();
  });

  it('closes dialog without resetting when Cancel is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/reset all data/i)).not.toBeInTheDocument();
  });

  it('resets data and closes dialog when Reset is confirmed', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }));
    const confirmBtn = screen.getAllByRole('button', { name: /^reset$/i }).at(-1);
    fireEvent.click(confirmBtn);
    expect(screen.queryByText(/reset all data/i)).not.toBeInTheDocument();
  });
});
