import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  SIZE_UNITS,
  detectOverlaps,
  buildSegments,
  calcAllocatedBlocks,
  calcOverlapBlocks,
} from '../utils';

const STORAGE_KEY = 'diskPartitionState';

function loadFromStorage(defaults) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaults, ...JSON.parse(saved) };
  } catch {}
  return defaults;
}

/**
 * Central state hook for the disk partition visualizer.
 *
 * Returns all derived state (totalBlocks, segments, overlaps, stats)
 * plus mutation helpers for partitions.
 */
export default function useDiskState(initialConfig = {}) {
  const {
    diskSize: initDiskSize = '500',
    diskUnit: initDiskUnit = 'GB',
    sectorSize: initSectorSize = 512,
    partitions: initPartitions = [],
  } = initialConfig;

  const saved = loadFromStorage({
    diskSizeValue: initDiskSize,
    diskSizeUnit: initDiskUnit,
    sectorSize: initSectorSize,
    partitions: initPartitions,
  });

  const [diskSizeValue, setDiskSizeValue] = useState(saved.diskSizeValue);
  const [diskSizeUnit, setDiskSizeUnit] = useState(saved.diskSizeUnit);
  const [sectorSize, setSectorSize] = useState(saved.sectorSize);
  const [partitions, setPartitions] = useState(saved.partitions);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ diskSizeValue, diskSizeUnit, sectorSize, partitions }));
    } catch {}
  }, [diskSizeValue, diskSizeUnit, sectorSize, partitions]);

  // Derived values
  const diskBytes = useMemo(() => {
    const v = parseFloat(diskSizeValue) || 0;
    return v * (SIZE_UNITS[diskSizeUnit] || 1);
  }, [diskSizeValue, diskSizeUnit]);

  const totalBlocks = useMemo(
    () => Math.floor(diskBytes / (sectorSize || 512)),
    [diskBytes, sectorSize]
  );

  const overlaps = useMemo(() => detectOverlaps(partitions), [partitions]);

  const segments = useMemo(
    () => buildSegments(partitions, totalBlocks),
    [partitions, totalBlocks]
  );

  const allocatedBlocks = useMemo(
    () => calcAllocatedBlocks(partitions, totalBlocks),
    [partitions, totalBlocks]
  );

  const overlapBlocks = useMemo(() => calcOverlapBlocks(overlaps), [overlaps]);

  const freeBlocks = Math.max(0, totalBlocks - allocatedBlocks + overlapBlocks);

  // Mutation helpers
  const addPartition = useCallback((partition) => {
    setPartitions((prev) => [...prev, partition]);
  }, []);

  const updatePartition = useCallback((index, partition) => {
    setPartitions((prev) => prev.map((p, i) => (i === index ? partition : p)));
  }, []);

  const removePartition = useCallback((index) => {
    setPartitions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const loadPreset = useCallback((preset) => {
    setDiskSizeValue(preset.disk);
    setDiskSizeUnit(preset.unit);
    setSectorSize(parseInt(preset.sector));
    setPartitions(preset.partitions);
  }, []);

  const setTotalBlocks = useCallback((blocks) => {
    const parsed = parseInt(blocks);
    if (isNaN(parsed) || parsed < 0) return;
    const newBytes = parsed * sectorSize;
    const unitMultiplier = SIZE_UNITS[diskSizeUnit] || 1;
    setDiskSizeValue(String(newBytes / unitMultiplier));
  }, [sectorSize, diskSizeUnit]);

  const reset = useCallback(() => {
    setDiskSizeValue(initDiskSize);
    setDiskSizeUnit(initDiskUnit);
    setSectorSize(initSectorSize);
    setPartitions(initPartitions);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, [initDiskSize, initDiskUnit, initSectorSize, initPartitions]);

  return {
    // Config state + setters
    diskSizeValue,
    setDiskSizeValue,
    diskSizeUnit,
    setDiskSizeUnit,
    sectorSize,
    setSectorSize,
    partitions,
    setPartitions,

    // Derived
    diskBytes,
    totalBlocks,
    overlaps,
    segments,
    allocatedBlocks,
    overlapBlocks,
    freeBlocks,

    // Actions
    addPartition,
    updatePartition,
    removePartition,
    loadPreset,
    setTotalBlocks,
    reset,
  };
}
