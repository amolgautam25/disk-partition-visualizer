import { formatSize, formatBlocks, SECTOR_SIZES } from '../utils';

/**
 * Configuration panel for disk size, sector size, and computed stats.
 */
export default function DiskConfig({
  diskSizeValue,
  setDiskSizeValue,
  diskSizeUnit,
  setDiskSizeUnit,
  sectorSize,
  setSectorSize,
  totalBlocks,
  diskBytes,
  allocatedBlocks,
  freeBlocks,
  overlaps,
  overlapBlocks,
}) {
  const inputCls =
    'bg-[#0F172A] border border-slate-700 rounded-[5px] px-2.5 py-2 text-slate-200 font-mono text-xs outline-none w-full transition-colors focus:border-blue-500';
  const labelCls = 'text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-semibold';

  return (
    <div className="bg-disk-surface rounded-[10px] p-5 mb-4 border border-disk-border">
      <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider mb-3.5">
        ⛁ Disk Configuration
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
        {/* Disk size */}
        <div>
          <div className={labelCls}>Disk Size</div>
          <div className="flex gap-1.5">
            <input
              value={diskSizeValue}
              onChange={(e) => setDiskSizeValue(e.target.value)}
              className={inputCls + ' flex-1'}
              placeholder="500"
            />
            <select
              value={diskSizeUnit}
              onChange={(e) => setDiskSizeUnit(e.target.value)}
              className={inputCls + ' !w-[72px] cursor-pointer text-center'}
            >
              {['B', 'KB', 'MB', 'GB', 'TB'].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sector size */}
        <div>
          <div className={labelCls}>Sector Size</div>
          <select
            value={sectorSize}
            onChange={(e) => setSectorSize(parseInt(e.target.value))}
            className={inputCls + ' cursor-pointer text-center'}
          >
            {SECTOR_SIZES.map((s) => (
              <option key={s} value={s}>{s} B</option>
            ))}
          </select>
        </div>

        {/* Total blocks */}
        <div>
          <div className={labelCls}>Total Blocks</div>
          <div className="bg-[#0F172A] rounded-[5px] px-2.5 py-2 border border-disk-border font-mono text-[13px] font-bold text-blue-500 tracking-wide">
            {totalBlocks.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mt-3.5 flex-wrap text-[10px] font-mono">
        <Stat label="Disk Size" value={formatSize(diskBytes)} color="#F8FAFC" />
        <Stat label="Allocated" value={`${formatBlocks(allocatedBlocks)} blocks`} color="#10B981" />
        <Stat label="Free" value={`${formatBlocks(freeBlocks)} blocks`} color="#F59E0B" />
        <Stat
          label="Overlapping"
          value={
            overlaps.length > 0
              ? `${overlapBlocks.toLocaleString()} blocks (${overlaps.length} conflict${overlaps.length > 1 ? 's' : ''})`
              : 'None'
          }
          color={overlaps.length > 0 ? '#DC2626' : '#475569'}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <span className="text-slate-500">{label}: </span>
      <span className="font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
