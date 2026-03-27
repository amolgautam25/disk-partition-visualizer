import { useState } from 'react';
import { UNALLOC_COLOR } from '../utils';
import { formatBlocks } from '../utils';

/**
 * Donut-style pie chart showing partition allocation proportions.
 * Hover a segment to see details in the center.
 */
export default function PieChart({ segments, totalBlocks }) {
  const cx = 140;
  const cy = 140;
  const r = 120;
  const ir = 55;
  const [hovered, setHovered] = useState(null);

  const allocated = segments.filter((s) => s.type !== 'unallocated');

  if (allocated.length === 0) {
    return (
      <svg width={280} height={280} viewBox="0 0 280 280" role="img" aria-label="Empty disk — 100% unallocated">
        <circle cx={cx} cy={cy} r={r} fill={UNALLOC_COLOR} />
        <circle cx={cx} cy={cy} r={ir} fill="#0F172A" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="'IBM Plex Mono', monospace">
          100%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
          UNALLOCATED
        </text>
      </svg>
    );
  }

  // Build arc paths
  const paths = [];
  let angle = -Math.PI / 2;

  allocated.forEach((seg, i) => {
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
        opacity={hovered !== null && !isHov ? 0.5 : 1}
        style={{
          transform: isHov ? 'scale(1.04)' : 'scale(1)',
          transformOrigin: `${cx}px ${cy}px`,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          filter: isHov ? `drop-shadow(0 0 8px ${seg.color}88)` : 'none',
        }}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
      />
    );
    angle = endAngle;
  });

  const hovSeg = hovered !== null ? allocated[hovered] : null;

  return (
    <svg width={280} height={280} viewBox="0 0 280 280" role="img" aria-label="Disk allocation pie chart">
      {paths}
      <circle cx={cx} cy={cy} r={ir - 1} fill="#0F172A" />
      {hovSeg ? (
        <>
          <text x={cx} y={cy - 10} textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="600" fontFamily="'IBM Plex Mono', monospace">
            {hovSeg.label}
          </text>
          <text x={cx} y={cy + 6} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="'IBM Plex Mono', monospace">
            {((hovSeg.blocks / totalBlocks) * 100).toFixed(1)}%
          </text>
          <text x={cx} y={cy + 20} textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="'IBM Plex Mono', monospace">
            {formatBlocks(hovSeg.blocks)} blocks
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="'IBM Plex Mono', monospace">
            TOTAL
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700" fontFamily="'IBM Plex Mono', monospace">
            {formatBlocks(totalBlocks)}
          </text>
        </>
      )}
    </svg>
  );
}
