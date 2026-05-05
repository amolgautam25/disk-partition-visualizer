import { UNALLOC_COLOR } from '../utils';

export default function Legend({ segments, totalBlocks }) {
  const allocated = segments.filter((s) => s.type !== 'unallocated');

  return (
    <div className="mt-3 w-full">
      {allocated.map((s, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5 text-[12px]">
          <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
          <span className="text-[#ebebf5] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {s.label}
          </span>
          <span className="text-[#636366] font-mono text-[11px]">
            {((s.blocks / totalBlocks) * 100).toFixed(1)}%
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-[12px] mt-1">
        <div
          className="w-2 h-2 rounded-sm shrink-0"
          style={{
            background: `repeating-linear-gradient(135deg, ${UNALLOC_COLOR} 0px, ${UNALLOC_COLOR} 2px, #2c2c2e 2px, #2c2c2e 4px)`,
          }}
        />
        <span className="text-[#48484a]">Unallocated</span>
      </div>
    </div>
  );
}
