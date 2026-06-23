import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface SuccessOverlayProps {
  milestone: string;
  onClose: () => void;
}

export default function SuccessOverlay({ milestone, onClose }: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm rounded-2xl border border-indigo-500/30 bg-gray-900 p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <Send className="w-7 h-7 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Submission Sent!</h2>
        <p className="text-sm text-gray-400 mb-2 leading-relaxed">
          Your progress on <span className="text-white font-medium">Milestone {milestone}</span> has been submitted for
          peer review.
        </p>
        <p className="text-[11px] text-gray-500 mb-6">
          Reviewers will evaluate and respond within 24–48h. You'll receive a notification once approved or if changes
          are requested.
        </p>
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
          >
            Back to Dashboard
          </button>
          <button className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-sm text-gray-300 transition-colors">
            View Submission Status
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
