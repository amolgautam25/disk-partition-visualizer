import { useState } from 'react';
import useDiskState from './hooks/useDiskState';
import useCustomPresets from './hooks/useCustomPresets';
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
  const { customPresets, savePreset, deletePreset } = useCustomPresets();
  const [editIdx, setEditIdx] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [savePresetName, setSavePresetName] = useState(null);

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

  const handleSavePreset = () => setSavePresetName('');

  const handleConfirmSavePreset = () => {
    if (!savePresetName.trim()) return;
    savePreset(savePresetName.trim(), {
      diskSizeValue: disk.diskSizeValue,
      diskSizeUnit: disk.diskSizeUnit,
      sectorSize: disk.sectorSize,
      partitions: disk.partitions,
    });
    setSavePresetName(null);
  };

  return (
    <div className="min-h-screen bg-disk-bg p-6 md:px-4">
      {/* Header */}
      <div className="max-w-[900px] mx-auto mb-7">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7">
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="logo" className="w-full h-full" />
            </div>
            <h1 className="m-0 text-[20px] font-display font-bold text-white tracking-tight">
              Disk Partition Visualizer
            </h1>
          </div>
          <button
            onClick={() => setConfirmReset(true)}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-[#3a3a3c] text-[#ff453a] hover:bg-[#ff453a]/10 hover:border-[#ff453a]/50 transition-colors"
          >
            Reset
          </button>
        </div>
        <p className="m-0 text-[11px] text-[#48484a] ml-[38px] font-mono">
          Interactive block-level partition layout · LBA addressing · Overlap detection
        </p>
      </div>

      {/* Reset confirmation dialog */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-disk-surface border border-disk-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h2 className="text-white font-semibold text-[15px] mb-2">Reset all data?</h2>
            <p className="text-[#8e8e9d] text-[13px] mb-5 leading-relaxed">
              This will clear all partitions and restore the default disk configuration.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmReset(false)}
                className="text-[13px] px-4 py-1.5 rounded-lg border border-disk-border text-[#8e8e9d] hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="text-[13px] px-4 py-1.5 rounded-lg bg-[#ff453a] hover:bg-[#ff6961] text-white transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save preset modal */}
      {savePresetName !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-disk-surface border border-disk-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-slate-100 font-semibold text-base mb-2">Save preset</h2>
            <input
              autoFocus
              value={savePresetName}
              onChange={(e) => setSavePresetName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSavePreset(); if (e.key === 'Escape') setSavePresetName(null); }}
              placeholder="Preset name"
              className="w-full bg-[#0F172A] border border-slate-700 rounded-[5px] px-3 py-2 text-slate-200 font-mono text-xs outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSavePresetName(null)}
                className="text-[12px] font-mono px-4 py-1.5 rounded-md border border-disk-border text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSavePreset}
                disabled={!savePresetName.trim()}
                className="text-[12px] font-mono px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[900px] mx-auto">
        <DiskConfig
          diskSizeValue={disk.diskSizeValue}
          setDiskSizeValue={disk.setDiskSizeValue}
          diskSizeUnit={disk.diskSizeUnit}
          setDiskSizeUnit={disk.setDiskSizeUnit}
          sectorSize={disk.sectorSize}
          setSectorSize={disk.setSectorSize}
          totalBlocks={disk.totalBlocks}
          setTotalBlocks={disk.setTotalBlocks}
          diskBytes={disk.diskBytes}
          allocatedBlocks={disk.allocatedBlocks}
          freeBlocks={disk.freeBlocks}
          overlaps={disk.overlaps}
          overlapBlocks={disk.overlapBlocks}
        />

        {/* Visualizations */}
        <div className="grid grid-cols-[280px_1fr] gap-4 mb-4 max-lg:grid-cols-1">
          {/* Pie chart panel */}
          <div className="bg-disk-surface rounded-xl p-4 border border-disk-border flex flex-col items-center">
            <div className="text-[11px] text-[#8e8e9d] font-semibold uppercase tracking-widest mb-3 self-start">
              ◔ Allocation
            </div>
            <PieChart segments={disk.segments} totalBlocks={disk.totalBlocks} />
            <Legend segments={disk.segments} totalBlocks={disk.totalBlocks} />
          </div>

          {/* Disk bar panel */}
          <div className="bg-disk-surface rounded-xl p-4 border border-disk-border">
            <div className="text-[11px] text-[#8e8e9d] font-semibold uppercase tracking-widest mb-3">
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

        <PartitionForm
          partitions={disk.partitions}
          overlaps={disk.overlaps}
          totalBlocks={disk.totalBlocks}
          onAdd={disk.addPartition}
          onUpdate={disk.updatePartition}
          editIdx={editIdx}
          setEditIdx={setEditIdx}
        />

        <PresetBar
          onLoad={handleLoadPreset}
          customPresets={customPresets}
          onSave={handleSavePreset}
          onDelete={deletePreset}
        />

        <div className="text-center mt-6 text-[10px] text-[#3a3a3c]">
          Built by Amol · Disk Partition Visualizer
        </div>
      </div>
    </div>
  );
}
