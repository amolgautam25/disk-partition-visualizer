import PRESETS from '../presets';

/**
 * Row of clickable preset buttons for common disk layouts.
 */
export default function PresetBar({ onLoad }) {
  return (
    <div className="flex gap-2 mt-3.5 flex-wrap items-center">
      <span className="text-[9px] text-slate-600 font-mono">Quick presets:</span>
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onLoad(preset)}
          title={preset.description}
          className="bg-disk-border border border-slate-700 rounded-[5px] text-slate-400 px-3 py-1 cursor-pointer text-[10px] font-mono transition-colors hover:border-blue-500 hover:text-slate-200"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
