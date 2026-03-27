import { useState, useMemo, useCallback } from 'react';
import {
  SIZE_UNITS,
  detectOverlaps,
  buildSegments,
  calcAllocatedBlocks,
  calcOverlapBlocks,
} from '../utils';

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

  const [diskSizeValue, setDiskSizeValue] = useState(initDiskSize);
  const [diskSizeUnit, setDiskSizeUnit] = useState(initDiskUnit);
  const [sectorSize, setSectorSize] = useState(initSectorSize);
  const [partitions, setPartitions] = useState(initPartitions);

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
  };
}
