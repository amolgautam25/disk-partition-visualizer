import { useState } from 'react';
import PRESETS from '../presets';

export default function PresetBar({ onLoad, customPresets, onSave, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const btnCls = 'bg-disk-border border border-slate-700 rounded-[5px] text-slate-400 px-3 py-1 cursor-pointer text-[10px] font-mono transition-colors hover:border-blue-500 hover:text-slate-200';

  return (
    <div className="mt-3.5 space-y-2">
      {/* Built-in presets */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[9px] text-slate-600 font-mono">Quick presets:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onLoad(preset)}
            title={preset.description}
            className={btnCls}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom presets */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[9px] text-slate-600 font-mono">My presets:</span>
        {customPresets.length === 0 && (
          <span className="text-[9px] text-slate-700 font-mono">None saved yet</span>
        )}
        {customPresets.map((preset) => (
          <div key={preset.id} className="flex items-center gap-0.5">
            {confirmDeleteId === preset.id ? (
              <>
                <span className="text-[9px] text-red-400 font-mono mr-1">Delete "{preset.label}"?</span>
                <button
                  onClick={() => { onDelete(preset.id); setConfirmDeleteId(null); }}
                  className="text-[9px] font-mono px-2 py-1 rounded-[4px] bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/70 cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-[9px] font-mono px-2 py-1 rounded-[4px] border border-slate-700 text-slate-500 hover:text-slate-300 cursor-pointer ml-0.5"
                >
                  No
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onLoad(preset)} className={btnCls}>
                  {preset.label}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(preset.id)}
                  title="Delete preset"
                  className="text-[10px] text-slate-600 hover:text-red-400 cursor-pointer px-1 transition-colors"
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
        <button
          onClick={onSave}
          className="bg-disk-border border border-slate-600 rounded-[5px] text-blue-400 px-3 py-1 cursor-pointer text-[10px] font-mono transition-colors hover:border-blue-500 hover:text-blue-300"
        >
          + Save Current
        </button>
      </div>
    </div>
  );
}
