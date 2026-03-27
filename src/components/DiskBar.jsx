import { useState, useRef } from 'react';
import { UNALLOC_COLOR, OVERLAP_COLOR, PARTITION_COLORS } from '../utils';
import { formatBlocks } from '../utils';

/**
 * Rectangular "Disk Manager" style bar showing block layout with LBA ruler,
 * partition boundaries, and hover tooltips.
 */
export default function DiskBar({ segments, totalBlocks, partitions }) {
  const [hovered, setHovered] = useState(null);
  const barRef = useRef(null);
  const [tipPos, setTipPos] = useState({ x: 0, visible: false });

  const handleMouse = (i, e) => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      setTipPos({ x: e.clientX - rect.left, visible: true });
    }
    setHovered(i);
  };

  const clearHover = () => {
    setHovered(null);
    setTipPos((p) => ({ ...p, visible: false }));
  };

  return (
    <div className="relative">
      {/* LBA ruler */}
      <div className="flex justify-between mb-1 font-mono text-[9px] text-slate-600">
        <span>LBA 0</span>
        <span>LBA {totalBlocks.toLocaleString()}</span>
      </div>

      {/* Main bar */}
      <div
        ref={barRef}
        className="flex w-full h-[52px] rounded-md overflow-hidden border border-slate-700"
        style={{
          background: `repeating-linear-gradient(90deg, ${UNALLOC_COLOR} 0px, ${UNALLOC_COLOR} 2px, #162032 2px, #162032 4px)`,
        }}
      >
        {segments.map((seg, i) => {
          const pct = (seg.blocks / totalBlocks) * 100;
          if (pct < 0.15) return null;
          const isHov = hovered === i;

          let bg;
          if (seg.type === 'unallocated') {
            bg = `repeating-linear-gradient(135deg, ${UNALLOC_COLOR} 0px, ${UNALLOC_COLOR} 3px, #1a2940 3px, #1a2940 6px)`;
          } else if (seg.type === 'overlap') {
            bg = `repeating-linear-gradient(45deg, ${OVERLAP_COLOR}CC 0px, ${OVERLAP_COLOR}CC 3px, ${OVERLAP_COLOR}88 3px, ${OVERLAP_COLOR}88 6px)`;
          } else {
            bg = seg.color;
          }

          return (
            <div
              key={i}
              onMouseEnter={(e) => handleMouse(i, e)}
              onMouseMove={(e) => handleMouse(i, e)}
              onMouseLeave={clearHover}
              className="relative transition-opacity duration-150 cursor-pointer"
              style={{
                width: `${pct}%`,
                height: '100%',
                background: bg,
                borderRight: '1px solid #0F172A',
                opacity: hovered !== null && !isHov ? 0.6 : 1,
                boxShadow: isHov ? 'inset 0 0 0 2px rgba(248,250,252,0.27)' : 'none',
              }}
            >
              {pct > 6 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono font-semibold text-white whitespace-nowrap pointer-events-none" style={{ textShadow: '0 1px 3px #000' }}>
                  {seg.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Boundary tick marks */}
      <div className="relative h-[18px]">
        {partitions.map((p, i) => {
          const startPct = (p.startBlock / totalBlocks) * 100;
          return (
            <div key={i}>
              <div
                className="absolute top-0 w-px h-2"
                style={{ left: `${startPct}%`, background: PARTITION_COLORS[i % PARTITION_COLORS.length] + '88' }}
              />
              <div
                className="absolute top-0 w-px h-2"
                style={{ left: `${(p.endBlock / totalBlocks) * 100}%`, background: PARTITION_COLORS[i % PARTITION_COLORS.length] + '88' }}
              />
              <div
                className="absolute font-mono text-[7px] text-slate-600 -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${startPct}%`, top: 9 }}
              >
                {formatBlocks(p.startBlock)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tipPos.visible && hovered !== null && segments[hovered] && (
        <div
          className="absolute pointer-events-none z-10 font-mono text-[10px] text-slate-200 rounded-md border border-slate-600 backdrop-blur-md shadow-xl"
          style={{
            top: -56,
            left: Math.min(tipPos.x, 260),
            background: '#1E293BEE',
            padding: '6px 10px',
          }}
        >
          <div className="font-bold mb-0.5" style={{ color: segments[hovered].color }}>
            {segments[hovered].label}
          </div>
          <div>
            Blocks {segments[hovered].startBlock?.toLocaleString()} → {segments[hovered].endBlock?.toLocaleString()}
          </div>
          <div className="text-slate-400">
            {formatBlocks(segments[hovered].blocks)} blocks · {((segments[hovered].blocks / totalBlocks) * 100).toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
}
