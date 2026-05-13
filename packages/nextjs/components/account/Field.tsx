export default function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-indigo-400">*</span>}
        {hint && (
          <span className="ml-auto text-xs font-normal text-gray-500">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}