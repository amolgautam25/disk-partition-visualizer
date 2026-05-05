import { PARTITION_COLORS, OVERLAP_COLOR, formatBlocks, formatSize } from '../utils';

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
            className="flex items-center gap-3 py-2 border-b border-disk-border"
          >
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: color }}
            />

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                {p.name}
                {hasOverlap && (
                  <span
                    className="text-[9px] rounded px-1.5 py-px font-medium"
                    style={{ color: OVERLAP_COLOR, background: '#ff453a22' }}
                  >
                    OVERLAP
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#8e8e9d] font-mono mt-0.5">
                LBA {p.startBlock.toLocaleString()} → {p.endBlock.toLocaleString()} ·{' '}
                {formatBlocks(blocks)} blocks · {pct.toFixed(2)}% ·{' '}
                {formatSize(blocks * sectorSize)}
              </div>
            </div>

            <button
              onClick={() => onEdit(i)}
              className="bg-transparent border border-disk-border rounded-md px-2.5 py-1 text-[#8e8e9d] text-[11px] cursor-pointer hover:border-disk-accent hover:text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onRemove(i)}
              className="bg-transparent border border-disk-border rounded-md px-2.5 py-1 text-[#ff453a] text-[11px] cursor-pointer hover:border-[#ff453a]/60 hover:bg-[#ff453a]/10 transition-colors"
            >
              ×
            </button>
          </div>
        );
      })}

      {partitions.length === 0 && (
        <div className="text-center py-8 text-[#48484a] text-[13px]">
          No partitions defined. Add one below or load a preset.
        </div>
      )}
    </div>
  );
}
