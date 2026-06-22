"use client";

import React, { useEffect, useRef } from "react";
import { X, Check } from "lucide-react";

interface FilterDropdownProps {
    label:    string;
    options:  string[];
    selected: string[];
    onToggle: (value: string) => void;
    onClose:  () => void;
}

export default function FilterDropdown({
    label,
    options,
    selected,
    onToggle,
    onClose,
}: FilterDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    {label}
                </p>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Options */}
            <div className="max-h-52 overflow-y-auto py-1">
                {options.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-gray-600 text-center">No options available</p>
                ) : (
                    options.map(opt => {
                        const isSelected = selected.includes(opt);
                        return (
                            <button
                                key={opt}
                                onClick={() => onToggle(opt)}
                                className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors text-left ${
                                    isSelected
                                        ? "bg-indigo-600/20 text-indigo-400"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                                }`}
                            >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                            </button>
                        );
                    })
                )}
            </div>

            {/* Clear selection */}
            {selected.length > 0 && (
                <div className="border-t border-gray-800 px-3 py-2">
                    <button
                        onClick={() => selected.forEach(s => onToggle(s))}
                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                    >
                        Clear {selected.length} selected
                    </button>
                </div>
            )}
        </div>
    );
}