import { PARTITION_COLORS, UNALLOC_COLOR, OVERLAP_COLOR } from './constants';

/**
 * Detect all pairwise overlaps between partitions.
 *
 * @param {Array<{startBlock: number, endBlock: number, name: string}>} partitions
 * @returns {Array<{i: number, j: number, start: number, end: number}>}
 */
export function detectOverlaps(partitions) {
  const overlaps = [];
  for (let i = 0; i < partitions.length; i++) {
    for (let j = i + 1; j < partitions.length; j++) {
      const a = partitions[i];
      const b = partitions[j];
      const overlapStart = Math.max(a.startBlock, b.startBlock);
      const overlapEnd = Math.min(a.endBlock, b.endBlock);
      if (overlapStart <= overlapEnd) {
        overlaps.push({ i, j, start: overlapStart, end: overlapEnd });
      }
    }
  }
  return overlaps;
}

/**
 * Build a flat array of visual segments from partition definitions.
 * Handles unallocated gaps, single-partition regions, and overlapping regions.
 *
 * Each segment: { label, blocks, startBlock, endBlock, color, type }
 * type is one of: 'unallocated' | 'partition' | 'overlap'
 *
 * @param {Array<{startBlock: number, endBlock: number, name: string}>} partitions
 * @param {number} totalBlocks
 * @returns {Array<Object>}
 */
export function buildSegments(partitions, totalBlocks) {
  if (totalBlocks <= 0) return [];

  // Build a sweep-line event list
  const events = [];
  partitions.forEach((p, i) => {
    if (p.startBlock >= 0 && p.endBlock >= p.startBlock && p.startBlock < totalBlocks) {
      const end = Math.min(p.endBlock, totalBlocks - 1);
      events.push({ pos: p.startBlock, type: 'start', idx: i });
      events.push({ pos: end + 1, type: 'end', idx: i });
    }
  });

  // Sort: by position, then ends before starts at same position
  events.sort((a, b) => a.pos - b.pos || (a.type === 'end' ? -1 : 1));

  const segments = [];
  const active = new Set();
  let lastPos = 0;

  for (const ev of events) {
    if (ev.pos > lastPos && ev.pos <= totalBlocks) {
      const blocks = ev.pos - lastPos;

      if (active.size === 0) {
        segments.push({
          label: 'Unallocated',
          blocks,
          startBlock: lastPos,
          endBlock: ev.pos - 1,
          color: UNALLOC_COLOR,
          type: 'unallocated',
        });
      } else if (active.size === 1) {
        const idx = [...active][0];
        segments.push({
          label: partitions[idx].name,
          blocks,
          startBlock: lastPos,
          endBlock: ev.pos - 1,
          color: PARTITION_COLORS[idx % PARTITION_COLORS.length],
          type: 'partition',
        });
      } else {
        const names = [...active].map((i) => partitions[i].name).join(' ∩ ');
        segments.push({
          label: `OVERLAP: ${names}`,
          blocks,
          startBlock: lastPos,
          endBlock: ev.pos - 1,
          color: OVERLAP_COLOR,
          type: 'overlap',
        });
      }
    }

    if (ev.type === 'start') active.add(ev.idx);
    else active.delete(ev.idx);
    lastPos = Math.max(lastPos, ev.pos);
  }

  // Trailing unallocated space
  if (lastPos < totalBlocks) {
    segments.push({
      label: 'Unallocated',
      blocks: totalBlocks - lastPos,
      startBlock: lastPos,
      endBlock: totalBlocks - 1,
      color: UNALLOC_COLOR,
      type: 'unallocated',
    });
  }

  return segments;
}

/**
 * Calculate total allocated blocks (may double-count overlaps).
 */
export function calcAllocatedBlocks(partitions, totalBlocks) {
  return partitions.reduce((sum, p) => {
    const end = Math.min(p.endBlock, totalBlocks - 1);
    return sum + Math.max(0, end - p.startBlock + 1);
  }, 0);
}

/**
 * Calculate total overlapping block count.
 */
export function calcOverlapBlocks(overlaps) {
  return overlaps.reduce((sum, o) => sum + (o.end - o.start + 1), 0);
}
