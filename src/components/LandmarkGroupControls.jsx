const GROUP_OPTIONS = [
  { key: 'faceOutline', label: 'Face Outline' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'mouth', label: 'Mouth' },
  { key: 'nose', label: 'Nose' },
  { key: 'fullMesh', label: 'Full Face Mesh' },
];

export default function LandmarkGroupControls({ groups, onChange }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-300">Landmark Groups</h3>
      <div className="flex flex-wrap gap-2">
        {GROUP_OPTIONS.map(({ key, label }) => {
          const active = groups[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...groups, [key]: !active })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                  : 'border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
