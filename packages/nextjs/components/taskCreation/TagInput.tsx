import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function TagInput({
  tags, onAdd, onRemove, placeholder,
}: {
  tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const s = val.trim();
    if (!s || tags.includes(s)) return;
    onAdd(s);
    setVal("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-xl border border-gray-800 hover:border-indigo-500/40 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-[11px] text-gray-300">
              {t}
              <button type="button" onClick={() => onRemove(t)} className="text-gray-600 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}