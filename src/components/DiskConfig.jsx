import { formatSize, formatBlocks, SECTOR_SIZES } from '../utils';

export default function DiskConfig({
  diskSizeValue,
  setDiskSizeValue,
  diskSizeUnit,
  setDiskSizeUnit,
  sectorSize,
  setSectorSize,
  totalBlocks,
  setTotalBlocks,
  diskBytes,
  allocatedBlocks,
  freeBlocks,
  overlaps,
  overlapBlocks,
}) {
  const inputCls =
    'bg-disk-bg border border-disk-border rounded-lg px-2.5 py-2 text-white text-[13px] outline-none w-full transition-all focus:border-disk-accent focus:ring-1 focus:ring-[#0a84ff]/20';
  const labelCls = 'text-[11px] text-[#8e8e9d] uppercase tracking-wider mb-1.5 font-medium';

  return (
    <div className="bg-disk-surface rounded-xl p-5 mb-4 border border-disk-border">
      <div className="text-[11px] text-[#8e8e9d] font-semibold uppercase tracking-widest mb-4">
        ⛁ Disk Configuration
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
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

        <div>
          <div className={labelCls}>Total Blocks (LBA)</div>
          <input
            value={totalBlocks}
            onChange={(e) => setTotalBlocks(e.target.value)}
            className={inputCls + ' font-mono font-bold text-disk-accent'}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-5 mt-4 flex-wrap text-[12px]">
        <Stat label="Disk Size" value={formatSize(diskBytes)} color="#ffffff" />
        <Stat label="Allocated" value={`${formatBlocks(allocatedBlocks)} blocks`} color="#30d158" />
        <Stat label="Free" value={`${formatBlocks(freeBlocks)} blocks`} color="#ff9f0a" />
        <Stat
          label="Overlapping"
          value={
            overlaps.length > 0
              ? `${overlapBlocks.toLocaleString()} blocks (${overlaps.length} conflict${overlaps.length > 1 ? 's' : ''})`
              : 'None'
          }
          color={overlaps.length > 0 ? '#ff453a' : '#48484a'}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <span className="text-[#636366]">{label}: </span>
      <span className="font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
