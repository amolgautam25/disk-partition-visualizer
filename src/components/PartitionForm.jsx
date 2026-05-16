import { useState, useEffect } from 'react';
import { PARTITION_COLORS, OVERLAP_COLOR } from '../utils';

export default function PartitionForm({
  partitions,
  overlaps,
  totalBlocks,
  onAdd,
  onUpdate,
  editIdx,
  setEditIdx,
}) {
  const [name, setName] = useState('');
  const [startBlock, setStartBlock] = useState('0');
  const [endBlock, setEndBlock] = useState(() =>
    totalBlocks > 0 ? (totalBlocks - 1).toString() : '999999'
  );

  useEffect(() => {
    if (editIdx !== null && partitions[editIdx]) {
      const p = partitions[editIdx];
      setName(p.name);
      setStartBlock(p.startBlock.toString());
      setEndBlock(p.endBlock.toString());
    }
  }, [editIdx, partitions]);

  const start = parseInt(startBlock);
  const end = parseInt(endBlock);

  let boundsError = null;
  if (!isNaN(start) && totalBlocks > 0 && start >= totalBlocks) {
    boundsError = `Start block ${start.toLocaleString()} is beyond the disk end (LBA ${(totalBlocks - 1).toLocaleString()})`;
  } else if (!isNaN(end) && totalBlocks > 0 && end >= totalBlocks) {
    boundsError = `End block ${end.toLocaleString()} exceeds disk size — max is LBA ${(totalBlocks - 1).toLocaleString()}`;
  }

  const handleSubmit = () => {
    const partName = name.trim() || `Partition ${partitions.length + 1}`;
    if (isNaN(start) || isNaN(end) || start < 0 || end < start || boundsError) return;

    const partition = { name: partName, startBlock: start, endBlock: end };

    if (editIdx !== null) {
      onUpdate(editIdx, partition);
      setEditIdx(null);
    } else {
      onAdd(partition);
    }
    setName('');
    setStartBlock('0');
    setEndBlock(totalBlocks > 0 ? (totalBlocks - 1).toString() : '999999');
  };

  const handleCancel = () => {
    setEditIdx(null);
    setName('');
    setStartBlock('0');
    setEndBlock(totalBlocks > 0 ? (totalBlocks - 1).toString() : '999999');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') handleCancel();
  };

  const inputCls =
    'bg-disk-bg border border-disk-border rounded-lg px-2.5 py-2 text-white text-[13px] outline-none w-full transition-all focus:border-disk-accent focus:ring-1 focus:ring-[#0a84ff]/20';
  const labelCls = 'text-[11px] text-[#8e8e9d] uppercase tracking-wider mb-1.5 font-medium block';

  const isEditing = editIdx !== null;
  const accentColor = isEditing ? PARTITION_COLORS[editIdx % PARTITION_COLORS.length] : '#0a84ff';

  return (
    <div
      className="bg-disk-surface rounded-xl p-5 border"
      style={{ borderColor: isEditing ? accentColor + '44' : '#3a3a3c' }}
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-widest mb-4"
        style={{ color: isEditing ? accentColor : '#8e8e9d' }}
      >
        {isEditing ? `✎ Editing: ${partitions[editIdx]?.name}` : '＋ Add Partition'}
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className={labelCls}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Partition ${partitions.length + 1}`}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Start Block (LBA)</label>
          <input
            value={startBlock}
            onChange={(e) => setStartBlock(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            type="number"
            min="0"
            className={inputCls + ' font-mono'}
          />
        </div>
        <div>
          <label className={labelCls}>End Block (LBA)</label>
          <input
            value={endBlock}
            onChange={(e) => setEndBlock(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={totalBlocks > 0 ? (totalBlocks - 1).toString() : '999999'}
            type="number"
            min="0"
            className={inputCls + ' font-mono'}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="rounded-lg text-white px-4 py-2 cursor-pointer font-semibold text-[13px] transition-colors"
            style={{ background: accentColor }}
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="bg-transparent border border-disk-border rounded-lg text-[#8e8e9d] px-3.5 py-2 cursor-pointer text-[13px] hover:border-disk-border-light transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {boundsError && (
        <div className="mt-4 p-3 rounded-lg bg-[#ff9f0a]/10 border border-[#ff9f0a]/25">
          <div className="text-[12px] font-semibold text-[#ff9f0a]">⚠ Out of Bounds</div>
          <div className="text-[11px] text-[#ff9f0a]/80 font-mono mt-0.5">{boundsError}</div>
        </div>
      )}

      {overlaps.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[#ff453a]/10 border border-[#ff453a]/25">
          <div className="text-[12px] font-semibold mb-1.5" style={{ color: OVERLAP_COLOR }}>
            ⚠ Partition Overlap Detected
          </div>
          {overlaps.map((o, i) => (
            <div key={i} className="text-[11px] text-[#ff6961] mb-0.5 font-mono">
              <strong>{partitions[o.i]?.name}</strong> ∩ <strong>{partitions[o.j]?.name}</strong>
              {' — blocks '}
              {o.start.toLocaleString()} to {o.end.toLocaleString()} (
              {(o.end - o.start + 1).toLocaleString()} conflicting blocks)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
