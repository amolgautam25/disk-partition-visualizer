import { useState, useEffect } from 'react';
import { PARTITION_COLORS, OVERLAP_COLOR } from '../utils';

/**
 * Form for creating or editing a partition.
 * Shows overlap warnings when conflicts exist.
 */
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
  const [startBlock, setStartBlock] = useState('');
  const [endBlock, setEndBlock] = useState('');

  // Populate fields when editing
  useEffect(() => {
    if (editIdx !== null && partitions[editIdx]) {
      const p = partitions[editIdx];
      setName(p.name);
      setStartBlock(p.startBlock.toString());
      setEndBlock(p.endBlock.toString());
    }
  }, [editIdx, partitions]);

  const handleSubmit = () => {
    const start = parseInt(startBlock);
    const end = parseInt(endBlock);
    const partName = name.trim() || `Partition ${partitions.length + 1}`;
    if (isNaN(start) || isNaN(end) || start < 0 || end < start) return;

    const partition = { name: partName, startBlock: start, endBlock: end };

    if (editIdx !== null) {
      onUpdate(editIdx, partition);
      setEditIdx(null);
    } else {
      onAdd(partition);
    }
    setName('');
    setStartBlock('');
    setEndBlock('');
  };

  const handleCancel = () => {
    setEditIdx(null);
    setName('');
    setStartBlock('');
    setEndBlock('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') handleCancel();
  };

  const inputCls =
    'bg-[#0F172A] border border-slate-700 rounded-[5px] px-2.5 py-2 text-slate-200 font-mono text-xs outline-none w-full transition-colors focus:border-blue-500';

  const isEditing = editIdx !== null;
  const borderColor = isEditing ? PARTITION_COLORS[editIdx % PARTITION_COLORS.length] + '44' : undefined;

  return (
    <div
      className="bg-disk-surface rounded-[10px] p-5 border"
      style={{ borderColor: borderColor || '#1E293B' }}
    >
      <div
        className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-3.5"
        style={{ color: isEditing ? PARTITION_COLORS[editIdx % PARTITION_COLORS.length] : '#94A3B8' }}
      >
        {isEditing ? `✎ Editing: ${partitions[editIdx]?.name}` : '＋ Create Partition'}
      </div>

      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-semibold block">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Partition ${partitions.length + 1}`}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-semibold block">
            Start Block (LBA)
          </label>
          <input
            value={startBlock}
            onChange={(e) => setStartBlock(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            type="number"
            min="0"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-semibold block">
            End Block (LBA)
          </label>
          <input
            value={endBlock}
            onChange={(e) => setEndBlock(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={totalBlocks > 0 ? (totalBlocks - 1).toString() : '999999'}
            type="number"
            min="0"
            className={inputCls}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-br from-blue-500 to-indigo-500 border-none rounded-md text-white px-4 py-2 cursor-pointer font-bold text-[11px] font-mono tracking-wide shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
          >
            {isEditing ? 'UPDATE' : 'ADD'}
          </button>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="bg-transparent border border-slate-700 rounded-md text-slate-400 px-3.5 py-2 cursor-pointer text-[11px] font-mono hover:border-slate-500 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Overlap warnings */}
      {overlaps.length > 0 && (
        <div className="mt-3.5 p-2.5 rounded-md bg-red-600/[0.07] border border-red-600/20">
          <div className="text-[10px] font-bold mb-1" style={{ color: OVERLAP_COLOR }}>
            ⚠ Partition Overlap Detected
          </div>
          {overlaps.map((o, i) => (
            <div key={i} className="text-[9px] text-red-300 mb-0.5 font-mono">
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
