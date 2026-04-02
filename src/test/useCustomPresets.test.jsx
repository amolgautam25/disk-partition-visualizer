import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import useCustomPresets from '../hooks/useCustomPresets';
import App from '../App';

const STORAGE_KEY = 'diskPartitionCustomPresets';

beforeEach(() => {
  localStorage.clear();
});

describe('useCustomPresets', () => {
  it('starts with empty presets when localStorage is empty', () => {
    const { result } = renderHook(() => useCustomPresets());
    expect(result.current.customPresets).toEqual([]);
  });

  it('saves a preset and persists to localStorage', () => {
    const { result } = renderHook(() => useCustomPresets());

    act(() => {
      result.current.savePreset('My Config', {
        diskSizeValue: '500',
        diskSizeUnit: 'GB',
        sectorSize: 512,
        partitions: [{ name: 'boot', startBlock: 0, endBlock: 100 }],
      });
    });

    expect(result.current.customPresets).toHaveLength(1);
    expect(result.current.customPresets[0].label).toBe('My Config');
    expect(result.current.customPresets[0].partitions).toHaveLength(1);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved).toHaveLength(1);
    expect(saved[0].label).toBe('My Config');
  });

  it('deletes a preset by id', () => {
    const { result } = renderHook(() => useCustomPresets());

    act(() => {
      result.current.savePreset('To Delete', {
        diskSizeValue: '100',
        diskSizeUnit: 'GB',
        sectorSize: 512,
        partitions: [],
      });
    });

    const id = result.current.customPresets[0].id;

    act(() => {
      result.current.deletePreset(id);
    });

    expect(result.current.customPresets).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(0);
  });

  it('restores presets from localStorage on init', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: 'user-1', label: 'Saved', disk: '250', unit: 'GB', sector: '512', partitions: [] },
    ]));

    const { result } = renderHook(() => useCustomPresets());
    expect(result.current.customPresets).toHaveLength(1);
    expect(result.current.customPresets[0].label).toBe('Saved');
  });
});

describe('Save preset UI', () => {
  it('shows Save Current button', () => {
    render(<App />);
    expect(screen.getByText('+ Save Current')).toBeInTheDocument();
  });

  it('opens save modal when Save Current is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ Save Current'));
    expect(screen.getByPlaceholderText('Preset name')).toBeInTheDocument();
  });

  it('closes modal on Cancel', () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ Save Current'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByPlaceholderText('Preset name')).not.toBeInTheDocument();
  });

  it('saves preset and closes modal on Save', () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ Save Current'));
    fireEvent.change(screen.getByPlaceholderText('Preset name'), { target: { value: 'My Layout' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(screen.queryByPlaceholderText('Preset name')).not.toBeInTheDocument();
    expect(screen.getByText('My Layout')).toBeInTheDocument();
  });
});
