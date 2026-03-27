import { PARTITION_COLORS, OVERLAP_COLOR, formatBlocks, formatSize } from '../utils';

/**
 * Detailed table of all partitions with LBA ranges, size, percentage, and
 * overlap indicators. Each partition can be edited or removed.
 */
export default function PartitionTable({
  partitions,
  totalBlocks,
  sectorSize,
  overlaps,
  onEdit,
  onRemove,
}) {
  return (
    <div className="mt-4">
      {partitions.map((p, i) => {
        const blocks = Math.max(0, Math.min(p.endBlock, totalBlocks - 1) - p.startBlock + 1);
        const pct = totalBlocks > 0 ? (blocks / totalBlocks) * 100 : 0;
        const hasOverlap = overlaps.some((o) => o.i === i || o.j === i);
        const color = PARTITION_COLORS[i % PARTITION_COLORS.length];

        return (
          <div
            key={i}
            className="flex items-center gap-2.5 py-1.5 border-b border-disk-border"
          >
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: color }}
            />

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                {p.name}
                {hasOverlap && (
                  <span
                    className="text-[8px] rounded-sm px-1.5 py-px"
                    style={{ color: OVERLAP_COLOR, background: '#DC262622' }}
                  >
                    OVERLAP
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                LBA {p.startBlock.toLocaleString()} → {p.endBlock.toLocaleString()} ·{' '}
                {formatBlocks(blocks)} blocks · {pct.toFixed(2)}% ·{' '}
                {formatSize(blocks * sectorSize)}
              </div>
            </div>

            <button
              onClick={() => onEdit(i)}
              className="bg-transparent border border-slate-700 rounded px-2 py-0.5 text-slate-500 text-[9px] font-mono cursor-pointer hover:border-blue-500 hover:text-slate-300 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onRemove(i)}
              className="bg-transparent border border-slate-700 rounded px-2 py-0.5 text-red-500 text-[9px] font-mono cursor-pointer hover:border-red-500 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </div>
        );
      })}

      {partitions.length === 0 && (
        <div className="text-center py-6 text-slate-600 text-xs font-mono">
          No partitions defined. Add one below or load a preset.
        </div>
      )}
    </div>
  );
}
