import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BadgeCheck, CheckCircle2, Lock } from "lucide-react";

interface TaskStakeData {
  stakeRequired: number;
  reward: number;
  deadlineDate: string;
  title?: string; // only for signing message
}

interface StakePanelProps {
  step: number;
  setStep: (n: number) => void;
  onConfirm: () => void;
  task: TaskStakeData;
}

const STEPS = [
  { id: 1, label: "Review Task" },
  { id: 2, label: "Stake USDC" },
  { id: 3, label: "Confirm & Sign" },
];

export default function StakePanel({ step, setStep, onConfirm, task }: StakePanelProps) {
  const [agreed, setAgreed] = useState(false);
  const [staking, setStaking] = useState(false);

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      setStep(3);
    }, 1500);
  };

  const handleSign = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      onConfirm();
    }, 1800);
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Step progress */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                    step >= s.id ? "bg-indigo-500 text-white" : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="w-3 h-3" /> : s.id}
                </div>
                <span className={`text-[10px] font-medium ${step >= s.id ? "text-gray-200" : "text-gray-600"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 mx-1 transition-colors ${step > s.id ? "bg-indigo-500/60" : "bg-gray-800"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Step 1 — Review */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Stake-Backed Commitment</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Joining this task locks <span className="text-white font-semibold">{task.stakeRequired} USDC</span> as
                  stake. If you abandon without resolution, part of your stake may be slashed.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Stake Summary</p>
              {[
                ["You lock", `${task.stakeRequired} USDC`],
                ["Potential reward", `+${task.reward} USDC`],
                ["Net if successful", `+${task.reward - task.stakeRequired} USDC`],
                ["Slash if abandoned", "Up to −20 USDC"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-gray-500">{k}</span>
                  <span
                    className={`font-semibold ${
                      v.startsWith("+") ? "text-emerald-400" : v.startsWith("Up to") ? "text-red-400" : "text-white"
                    }`}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  agreed ? "bg-indigo-500 border-indigo-500" : "border-gray-600 group-hover:border-gray-500"
                }`}
              >
                {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                I understand the stake terms and commit to completing this task by{" "}
                <span className="text-white font-medium">{task.deadlineDate}</span>.
              </p>
            </label>

            <button
              onClick={() => agreed && setStep(2)}
              disabled={!agreed}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
            >
              Continue to Stake
            </button>
          </motion.div>
        )}

        {/* Step 2 — Stake */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Wallet</span>
                <span className="text-xs font-mono text-gray-300">0x4a2f...8e3c</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">USDC Balance</span>
                <span className="text-xs font-semibold text-white">320.00 USDC</span>
              </div>
              <div className="h-px bg-gray-800" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Amount to Lock</span>
                <span className="text-sm font-bold text-indigo-300">{task.stakeRequired}.00 USDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Remaining</span>
                <span className="text-xs text-gray-300">280.00 USDC</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-3.5 flex gap-3">
              <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Funds are locked in the Team Chain smart contract escrow and released automatically upon task approval.
              </p>
            </div>

            <button
              onClick={handleStake}
              disabled={staking}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              {staking ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Locking Stake…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Lock {task.stakeRequired} USDC
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 3 — Sign */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">Stake Locked ✓</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {task.stakeRequired} USDC escrowed. Sign to finalize your commitment.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Signing Message</p>
              <p className="text-[11px] font-mono text-gray-400 leading-relaxed break-all">
                "I commit to task-001 on Team Chain. Stake: {task.stakeRequired} USDC. Deadline: {task.deadlineDate}.
                Chain: Mainnet."
              </p>
            </div>

            <button
              onClick={handleSign}
              disabled={staking}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              {staking ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing…
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  Sign & Join Task
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
