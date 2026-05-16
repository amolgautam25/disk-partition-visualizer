import { useState } from 'react';
import { UNALLOC_COLOR } from '../utils';
import { formatBlocks } from '../utils';

const FONT_UI = "-apple-system, 'SF Pro Text', system-ui, sans-serif";
const FONT_MONO = "'SF Mono', 'IBM Plex Mono', ui-monospace, monospace";

export default function PieChart({ segments, totalBlocks }) {
  const cx = 140;
  const cy = 140;
  const r = 120;
  const ir = 55;
  const [hovered, setHovered] = useState(null);

  if (segments.length === 0) {
    return (
      <svg width={280} height={280} viewBox="0 0 280 280" role="img" aria-label="Empty disk — 100% unallocated">
        <circle cx={cx} cy={cy} r={r} fill={UNALLOC_COLOR} />
        <circle cx={cx} cy={cy} r={ir} fill="#1c1c1e" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#636366" fontSize="13" fontFamily={FONT_MONO} fontWeight="500">
          100%
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill="#48484a" fontSize="10" fontFamily={FONT_UI} letterSpacing="0.08em">
          UNALLOCATED
        </text>
      </svg>
    );
  }

  const paths = [];
  let angle = -Math.PI / 2;

  segments.forEach((seg, i) => {
    const frac = seg.blocks / totalBlocks;
    const sweep = frac * 2 * Math.PI;
    const startAngle = angle;
    const endAngle = angle + sweep;
    const largeArc = sweep > Math.PI ? 1 : 0;

    const x1o = cx + r * Math.cos(startAngle);
    const y1o = cy + r * Math.sin(startAngle);
    const x2o = cx + r * Math.cos(endAngle);
    const y2o = cy + r * Math.sin(endAngle);
    const x1i = cx + ir * Math.cos(endAngle);
    const y1i = cy + ir * Math.sin(endAngle);
    const x2i = cx + ir * Math.cos(startAngle);
    const y2i = cy + ir * Math.sin(startAngle);

    const isHov = hovered === i;

    paths.push(
      <path
        key={i}
        d={`M ${x1o} ${y1o} A ${r} ${r} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${ir} ${ir} 0 ${largeArc} 0 ${x2i} ${y2i} Z`}
        fill={seg.color}
        opacity={hovered !== null && !isHov ? 0.45 : 1}
        style={{
          transform: isHov ? 'scale(1.04)' : 'scale(1)',
          transformOrigin: `${cx}px ${cy}px`,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          filter: isHov ? `drop-shadow(0 0 10px ${seg.color}99)` : 'none',
        }}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
      />
    );
    angle = endAngle;
  });

  const hovSeg = hovered !== null ? segments[hovered] : null;

  return (
    <svg width={280} height={280} viewBox="0 0 280 280" role="img" aria-label="Disk allocation pie chart">
      {paths}
      <circle cx={cx} cy={cy} r={ir - 1} fill="#1c1c1e" />
      {hovSeg ? (
        <>
          <text x={cx} y={cy - 10} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600" fontFamily={FONT_UI}>
            {hovSeg.label}
          </text>
          <text x={cx} y={cy + 7} textAnchor="middle" fill="#8e8e9d" fontSize="11" fontFamily={FONT_MONO}>
            {((hovSeg.blocks / totalBlocks) * 100).toFixed(1)}%
          </text>
          <text x={cx} y={cy + 22} textAnchor="middle" fill="#636366" fontSize="9" fontFamily={FONT_MONO}>
            {formatBlocks(hovSeg.blocks)} blocks
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#636366" fontSize="10" fontFamily={FONT_UI} letterSpacing="0.08em">
            TOTAL
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700" fontFamily={FONT_MONO}>
            {formatBlocks(totalBlocks)}
          </text>
        </>
      )}
    </svg>
  );
}
