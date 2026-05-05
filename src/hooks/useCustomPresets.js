import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'diskPartitionCustomPresets';

export default function useCustomPresets() {
  const [customPresets, setCustomPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
    } catch {}
  }, [customPresets]);

  const savePreset = useCallback((name, config) => {
    const preset = {
      id: `user-${Date.now()}`,
      label: name,
      disk: config.diskSizeValue,
      unit: config.diskSizeUnit,
      sector: String(config.sectorSize),
      partitions: config.partitions,
    };
    setCustomPresets((prev) => [...prev, preset]);
    return preset.id;
  }, []);

  const deletePreset = useCallback((id) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { customPresets, savePreset, deletePreset };
}
