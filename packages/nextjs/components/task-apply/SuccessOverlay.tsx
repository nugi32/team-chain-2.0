import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SuccessOverlayProps {
  onClose: () => void;
  taskTitle: string;
}

export default function SuccessOverlay({ onClose, taskTitle }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-gray-900 p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">You're In!</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          You've successfully joined{" "}
          <span className="text-white font-medium">{taskTitle}</span>. Your stake of{" "}
          <span className="text-indigo-300 font-semibold">40 USDC</span> is now locked.
        </p>
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
          >
            Go to Dashboard
          </button>
          <button className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-sm text-gray-300 transition-colors">
            View Task Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}