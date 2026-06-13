import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SaveBarProps {
  dirty: boolean;
  onSave: () => void;
  saving: boolean;
}

export default function SaveBar({ dirty, onSave, saving }: SaveBarProps) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-800"
        >
          <p className="text-[11px] text-gray-500">You have unsaved changes</p>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors text-xs font-semibold text-white"
          >
            {saving ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}