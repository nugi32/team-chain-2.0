import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
}

export default function OtpInput({ value, onChange }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => refs.current[i]?.focus();

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focus(index + 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const digits = raw.slice(0, 6 - index);
    const next =
      value.slice(0, index) + digits + value.slice(index + digits.length);
    onChange(next.slice(0, 6));
    const nextFocus = Math.min(index + digits.length, 5);
    setTimeout(() => focus(nextFocus), 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(digits);
    setTimeout(() => focus(Math.min(digits.length, 5)), 0);
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-full rounded-xl border text-center text-lg font-mono font-semibold",
            "bg-gray-950 outline-none transition-all duration-150",
            "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            value[i]
              ? "border-indigo-500 text-white"
              : "border-gray-700 text-gray-300",
          ].join(" ")}
        />
      ))}
    </div>
  );
}