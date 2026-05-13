import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  desc: string;
  cta: string;
  ctaClass: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title, desc, cta, ctaClass, onConfirm, onClose,
}: ConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-400">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">{desc}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-800 text-xs text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={["flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors", ctaClass].join(" ")}
          >
            {cta}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}