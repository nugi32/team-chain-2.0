export default function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-400 mb-1.5">{children}</label>
  );
}