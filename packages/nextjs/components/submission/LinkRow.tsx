import { Link as LinkIcon, X } from "lucide-react";

interface LinkRowProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onRemove: () => void;
  showRemove: boolean;
}

export default function LinkRow({ value, onChange, placeholder, onRemove, showRemove }: LinkRowProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 focus-within:border-indigo-500/60 transition-colors">
        <LinkIcon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
        />
      </div>
      {showRemove && (
        <button
          onClick={onRemove}
          className="w-9 h-9 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
