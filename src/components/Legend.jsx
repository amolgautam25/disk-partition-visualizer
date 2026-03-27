import { UNALLOC_COLOR } from '../utils';

/**
 * Color legend showing partition names and percentages.
 */
export default function Legend({ segments, totalBlocks }) {
  const allocated = segments.filter((s) => s.type !== 'unallocated');

  return (
    <div className="mt-2.5 w-full">
      {allocated.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5 mb-1 text-[9px] font-mono">
          <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
          <span className="text-slate-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {s.label}
          </span>
          <span className="text-slate-500">
            {((s.blocks / totalBlocks) * 100).toFixed(1)}%
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 text-[9px] font-mono mt-0.5">
        <div
          className="w-2 h-2 rounded-sm shrink-0"
          style={{
            background: `repeating-linear-gradient(135deg, ${UNALLOC_COLOR} 0px, ${UNALLOC_COLOR} 2px, #1a2940 2px, #1a2940 4px)`,
          }}
        />
        <span className="text-slate-600">Unallocated</span>
      </div>
    </div>
  );
}
