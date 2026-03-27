import { describe, it, expect } from 'vitest';
import { detectOverlaps, buildSegments, calcAllocatedBlocks, calcOverlapBlocks } from '../utils/partition';

describe('detectOverlaps', () => {
  it('returns empty for non-overlapping partitions', () => {
    const partitions = [
      { name: 'A', startBlock: 0, endBlock: 100 },
      { name: 'B', startBlock: 101, endBlock: 200 },
    ];
    expect(detectOverlaps(partitions)).toEqual([]);
  });

  it('detects a simple overlap', () => {
    const partitions = [
      { name: 'A', startBlock: 0, endBlock: 100 },
      { name: 'B', startBlock: 50, endBlock: 150 },
    ];
    const overlaps = detectOverlaps(partitions);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0]).toEqual({ i: 0, j: 1, start: 50, end: 100 });
  });

  it('detects multiple overlaps', () => {
    const partitions = [
      { name: 'A', startBlock: 0, endBlock: 100 },
      { name: 'B', startBlock: 50, endBlock: 150 },
      { name: 'C', startBlock: 80, endBlock: 200 },
    ];
    const overlaps = detectOverlaps(partitions);
    expect(overlaps).toHaveLength(3); // A∩B, A∩C, B∩C
  });

  it('detects exact boundary overlap (same endpoint)', () => {
    const partitions = [
      { name: 'A', startBlock: 0, endBlock: 100 },
      { name: 'B', startBlock: 100, endBlock: 200 },
    ];
    const overlaps = detectOverlaps(partitions);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].start).toBe(100);
    expect(overlaps[0].end).toBe(100);
  });

  it('returns empty for empty partition list', () => {
    expect(detectOverlaps([])).toEqual([]);
  });
});

describe('buildSegments', () => {
  it('returns single unallocated segment for empty partitions', () => {
    const segs = buildSegments([], 1000);
    expect(segs).toHaveLength(1);
    expect(segs[0].type).toBe('unallocated');
    expect(segs[0].blocks).toBe(1000);
  });

  it('returns empty for zero total blocks', () => {
    expect(buildSegments([], 0)).toEqual([]);
  });

  it('creates correct segments for a single partition', () => {
    const partitions = [{ name: 'Data', startBlock: 100, endBlock: 499 }];
    const segs = buildSegments(partitions, 1000);

    expect(segs).toHaveLength(3); // unalloc, partition, unalloc
    expect(segs[0].type).toBe('unallocated');
    expect(segs[0].blocks).toBe(100);
    expect(segs[1].type).toBe('partition');
    expect(segs[1].label).toBe('Data');
    expect(segs[1].blocks).toBe(400);
    expect(segs[2].type).toBe('unallocated');
    expect(segs[2].blocks).toBe(500);
  });

  it('creates overlap segments when partitions collide', () => {
    const partitions = [
      { name: 'A', startBlock: 0, endBlock: 100 },
      { name: 'B', startBlock: 50, endBlock: 200 },
    ];
    const segs = buildSegments(partitions, 1000);

    const overlapSeg = segs.find((s) => s.type === 'overlap');
    expect(overlapSeg).toBeDefined();
    expect(overlapSeg.startBlock).toBe(50);
    expect(overlapSeg.endBlock).toBe(100);
  });

  it('clamps partition end to totalBlocks', () => {
    const partitions = [{ name: 'Big', startBlock: 0, endBlock: 9999 }];
    const segs = buildSegments(partitions, 100);

    expect(segs).toHaveLength(1);
    expect(segs[0].blocks).toBe(100);
    expect(segs[0].endBlock).toBe(99);
  });
});

describe('calcAllocatedBlocks', () => {
  it('sums allocated blocks', () => {
    const partitions = [
      { name: 'A', startBlock: 0, endBlock: 99 },
      { name: 'B', startBlock: 200, endBlock: 299 },
    ];
    expect(calcAllocatedBlocks(partitions, 1000)).toBe(200);
  });

  it('returns 0 for no partitions', () => {
    expect(calcAllocatedBlocks([], 1000)).toBe(0);
  });
});

describe('calcOverlapBlocks', () => {
  it('sums overlap block counts', () => {
    const overlaps = [
      { i: 0, j: 1, start: 50, end: 100 },
      { i: 1, j: 2, start: 80, end: 90 },
    ];
    expect(calcOverlapBlocks(overlaps)).toBe(51 + 11);
  });

  it('returns 0 for no overlaps', () => {
    expect(calcOverlapBlocks([])).toBe(0);
  });
});
