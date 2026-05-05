import PRESETS from '../presets';

export default function PresetBar({ onLoad }) {
  return (
    <div className="flex gap-2 mt-4 flex-wrap items-center">
      <span className="text-[11px] text-[#636366]">Quick presets:</span>
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onLoad(preset)}
          title={preset.description}
          className="bg-disk-surface border border-disk-border rounded-lg text-[#8e8e9d] px-3 py-1.5 cursor-pointer text-[11px] font-medium transition-all hover:border-disk-accent hover:text-white"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
