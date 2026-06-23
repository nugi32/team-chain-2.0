"use client";

import React, { useEffect, useRef, useState } from "react";
import { COUNTRIES } from "@/components/getStarted/Countries";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

interface Country {
  flag: string;
  name: string;
  code: string;
  iso: string;
}

interface CountrySelectorProps {
  selected?: Country;
  onSelect: (c: Country) => void;
}

export default function CountrySelector({ selected, onSelect }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c: Country) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.includes(query),
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white hover:border-gray-600 transition-colors whitespace-nowrap"
      >
        <span>{selected?.flag ?? "🌍"}</span>

        <span className="font-mono text-gray-300">{selected?.code ?? "+--"}</span>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 w-72 rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                <input
                  autoFocus
                  type="text"
                  placeholder="Search country or code…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-500 text-white placeholder-gray-600"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No results for "{query}"</p>
              ) : (
                filtered.map((c: Country) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={[
                      "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left",
                      "hover:bg-gray-800 transition-colors",
                      selected?.iso === c.iso ? "bg-indigo-500/10" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{c.flag}</span>

                      <span className="text-gray-200">{c.name}</span>
                    </div>

                    <span className="font-mono text-gray-500 text-xs">{c.code}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
