import { useState, useRef, useCallback } from 'react';
import { UNALLOC_COLOR, OVERLAP_COLOR, PARTITION_COLORS } from '../utils';
import { formatBlocks } from '../utils';

const MIN_ZOOM = 1;
const MAX_ZOOM = 10;

/**
 * Rectangular "Disk Manager" style bar showing block layout with LBA ruler,
 * partition boundaries, hover tooltips, and zoom/pan support.
 */
export default function DiskBar({ segments, totalBlocks, partitions }) {
  const [hovered, setHovered] = useState(null);
  const barRef = useRef(null);
  const scrollRef = useRef(null);
  const [tipPos, setTipPos] = useState({ x: 0, visible: false });
  const [zoom, setZoom] = useState(1);

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

  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + (e.deltaY < 0 ? 1 : -1))));
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + 1));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - 1));
  const resetZoom = () => setZoom(1);

  // Visible LBA range for the ruler
  const scrollEl = scrollRef.current;
  const scrollPct = scrollEl ? scrollEl.scrollLeft / (scrollEl.scrollWidth - scrollEl.clientWidth || 1) : 0;
  const visibleBlocks = Math.floor(totalBlocks / zoom);
  const startLBA = Math.floor(scrollPct * (totalBlocks - visibleBlocks));
  const endLBA = Math.min(totalBlocks, startLBA + visibleBlocks);

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 text-slate-400 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="text-[9px] font-mono text-slate-500 w-6 text-center">{zoom}×</span>
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 text-slate-400 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
        {zoom > 1 && (
          <button
            onClick={resetZoom}
            className="text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
          >
            reset
          </button>
        )}
        {zoom > 1 && (
          <span className="text-[9px] font-mono text-slate-600 ml-1">
            LBA {startLBA.toLocaleString()} – {endLBA.toLocaleString()}
          </span>
        )}
        {zoom === 1 && (
          <span className="text-[9px] font-mono text-slate-700">Ctrl+scroll to zoom</span>
        )}
      </div>

      {/* LBA ruler */}
      <div className="flex justify-between mb-1 font-mono text-[9px] text-slate-600">
        <span>LBA {zoom > 1 ? startLBA.toLocaleString() : '0'}</span>
        <span>LBA {zoom > 1 ? endLBA.toLocaleString() : totalBlocks.toLocaleString()}</span>
      </div>

      {/* Scrollable zoom container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        onWheel={handleWheel}
        style={{ scrollbarWidth: zoom > 1 ? 'thin' : 'none' }}
      >
        {/* Main bar */}
        <div
          ref={barRef}
          className="flex h-[52px] rounded-md overflow-hidden border border-slate-700"
          style={{
            width: `${zoom * 100}%`,
            minWidth: '100%',
            background: `repeating-linear-gradient(90deg, ${UNALLOC_COLOR} 0px, ${UNALLOC_COLOR} 2px, #162032 2px, #162032 4px)`,
          }}
        >
          {segments.map((seg, i) => {
            const pct = (seg.blocks / totalBlocks) * 100;
            if (pct < 0.15 / zoom) return null;
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
                {pct * zoom > 6 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono font-semibold text-white whitespace-nowrap pointer-events-none" style={{ textShadow: '0 1px 3px #000' }}>
                    {seg.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Boundary tick marks */}
        <div className="relative h-[18px]" style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
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
      </div>

      {/* Minimap (shown when zoomed) */}
      {zoom > 1 && (
        <div className="mt-2">
          <div className="text-[8px] font-mono text-slate-700 mb-0.5">Overview</div>
          <div
            className="flex w-full h-[10px] rounded overflow-hidden border border-slate-800"
            style={{ background: UNALLOC_COLOR }}
          >
            {segments.map((seg, i) => {
              const pct = (seg.blocks / totalBlocks) * 100;
              if (pct < 0.1) return null;
              let bg;
              if (seg.type === 'unallocated') bg = UNALLOC_COLOR;
              else if (seg.type === 'overlap') bg = OVERLAP_COLOR;
              else bg = seg.color;
              return (
                <div key={i} style={{ width: `${pct}%`, background: bg, opacity: 0.8 }} />
              );
            })}
            {/* Viewport indicator */}
            <div
              className="absolute h-[10px] border border-white/30 bg-white/5 pointer-events-none"
              style={{
                width: `${(1 / zoom) * 100}%`,
                left: `${scrollPct * (1 - 1 / zoom) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

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
