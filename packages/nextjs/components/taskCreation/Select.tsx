export default function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 outline-none transition-colors appearance-none cursor-pointer"
    >
      {placeholder && (
        <option value="" className="text-gray-600">
          {placeholder}
        </option>
      )}
      {options.map(o => (
        <option key={o} value={o} className="bg-gray-900">
          {o}
        </option>
      ))}
    </select>
  );
}
