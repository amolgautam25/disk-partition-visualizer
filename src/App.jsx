import { useState } from 'react';
import useDiskState from './hooks/useDiskState';
import {
  PieChart,
  DiskBar,
  DiskConfig,
  PartitionTable,
  PartitionForm,
  PresetBar,
  Legend,
} from './components';

const DEFAULT_CONFIG = {
  diskSize: '500',
  diskUnit: 'GB',
  sectorSize: 512,
  partitions: [
    { name: 'EFI System', startBlock: 0, endBlock: 2047 },
    { name: 'Windows OS', startBlock: 2048, endBlock: 500000 },
    { name: 'Linux Root', startBlock: 500001, endBlock: 800000 },
  ],
};

export default function App() {
  const disk = useDiskState(DEFAULT_CONFIG);
  const [editIdx, setEditIdx] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    disk.reset();
    setEditIdx(null);
    setConfirmReset(false);
  };

  const handleEdit = (i) => setEditIdx(i);

  const handleRemove = (i) => {
    disk.removePartition(i);
    if (editIdx === i) setEditIdx(null);
  };

  const handleLoadPreset = (preset) => {
    disk.loadPreset(preset);
    setEditIdx(null);
  };

  return (
    <div className="min-h-screen bg-disk-bg p-6 md:px-4">
      {/* Header */}
      <div className="max-w-[900px] mx-auto mb-7">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-500 text-base">
              ◫
            </div>
            <h1 className="m-0 text-[22px] font-display font-bold text-slate-50 tracking-tight">
              Disk Partition Visualizer
            </h1>
          </div>
          <button
            onClick={() => setConfirmReset(true)}
            className="text-[11px] font-mono px-3 py-1.5 rounded-md border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            Reset
          </button>
        </div>
        <p className="m-0 text-[11px] text-slate-500 ml-[42px] font-mono">
          Interactive block-level partition layout · LBA addressing · Overlap detection
        </p>
      </div>

      {/* Reset confirmation dialog */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-disk-surface border border-disk-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-slate-100 font-semibold text-base mb-2">Reset all data?</h2>
            <p className="text-slate-400 text-[13px] mb-5">
              This will clear all partitions and restore the default disk configuration.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmReset(false)}
                className="text-[12px] font-mono px-4 py-1.5 rounded-md border border-disk-border text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="text-[12px] font-mono px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[900px] mx-auto">
        {/* Disk configuration */}
        <DiskConfig
          diskSizeValue={disk.diskSizeValue}
          setDiskSizeValue={disk.setDiskSizeValue}
          diskSizeUnit={disk.diskSizeUnit}
          setDiskSizeUnit={disk.setDiskSizeUnit}
          sectorSize={disk.sectorSize}
          setSectorSize={disk.setSectorSize}
          totalBlocks={disk.totalBlocks}
          diskBytes={disk.diskBytes}
          allocatedBlocks={disk.allocatedBlocks}
          freeBlocks={disk.freeBlocks}
          overlaps={disk.overlaps}
          overlapBlocks={disk.overlapBlocks}
        />

        {/* Visualizations: pie chart + disk bar */}
        <div className="grid grid-cols-[280px_1fr] gap-4 mb-4 max-lg:grid-cols-1">
          {/* Pie chart panel */}
          <div className="bg-disk-surface rounded-[10px] p-4 border border-disk-border flex flex-col items-center">
            <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider mb-2.5 self-start">
              ◔ Allocation Chart
            </div>
            <PieChart segments={disk.segments} totalBlocks={disk.totalBlocks} />
            <Legend segments={disk.segments} totalBlocks={disk.totalBlocks} />
          </div>

          {/* Disk bar panel */}
          <div className="bg-disk-surface rounded-[10px] p-4 border border-disk-border">
            <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider mb-3">
              ▭ Block Layout (LBA)
            </div>
            <DiskBar
              segments={disk.segments}
              totalBlocks={disk.totalBlocks}
              partitions={disk.partitions}
            />
            <PartitionTable
              partitions={disk.partitions}
              totalBlocks={disk.totalBlocks}
              sectorSize={disk.sectorSize}
              overlaps={disk.overlaps}
              onEdit={handleEdit}
              onRemove={handleRemove}
            />
          </div>
        </div>

        {/* Create / edit partition */}
        <PartitionForm
          partitions={disk.partitions}
          overlaps={disk.overlaps}
          totalBlocks={disk.totalBlocks}
          onAdd={disk.addPartition}
          onUpdate={disk.updatePartition}
          editIdx={editIdx}
          setEditIdx={setEditIdx}
        />

        {/* Presets */}
        <PresetBar onLoad={handleLoadPreset} />

        {/* Footer */}
        <div className="text-center mt-6 text-[9px] text-slate-700 font-mono">
          Built by Amol · Interactive Disk Partition Visualizer
        </div>
      </div>
    </div>
  );
}
