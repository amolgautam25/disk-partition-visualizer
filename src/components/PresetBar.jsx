import { useState } from 'react';
import PRESETS from '../presets';

export default function PresetBar({ onLoad, customPresets, onSave, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const btnCls = 'bg-disk-surface border border-disk-border rounded-lg text-[#8e8e9d] px-3 py-1.5 cursor-pointer text-[11px] font-medium transition-all hover:border-disk-accent hover:text-white';

  return (
    <div className="mt-4 space-y-2">
      {/* Built-in presets */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[11px] text-[#636366]">Quick presets:</span>
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
        <span className="text-[11px] text-[#636366]">My presets:</span>
        {customPresets.length === 0 && (
          <span className="text-[11px] text-[#48484a]">None saved yet</span>
        )}
        {customPresets.map((preset) => (
          <div key={preset.id} className="flex items-center gap-0.5">
            {confirmDeleteId === preset.id ? (
              <>
                <span className="text-[11px] text-[#ff453a] mr-1">Delete "{preset.label}"?</span>
                <button
                  onClick={() => { onDelete(preset.id); setConfirmDeleteId(null); }}
                  className="text-[11px] px-2 py-1 rounded-lg bg-[#ff453a]/10 border border-[#ff453a]/50 text-[#ff453a] hover:bg-[#ff453a]/20 cursor-pointer transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-disk-border text-[#8e8e9d] hover:bg-white/5 cursor-pointer ml-0.5 transition-colors"
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
                  className="text-[12px] text-[#48484a] hover:text-[#ff453a] cursor-pointer px-1 transition-colors"
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
        <button
          onClick={onSave}
          className="bg-disk-surface border border-disk-border rounded-lg text-[#0a84ff] px-3 py-1.5 cursor-pointer text-[11px] font-medium transition-all hover:border-[#0a84ff]/50 hover:text-[#409cff]"
        >
          + Save Current
        </button>
      </div>
    </div>
  );
}
