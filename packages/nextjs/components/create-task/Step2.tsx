import { motion } from "framer-motion";
import Label from "./Label";
import TextInput from "./TextInput";
import Hint from "./Hint";
import type { FormData } from "./types";

const EFFORT_OPTIONS = ["< 4 hrs", "4–8 hrs", "1–3 days", "1 week", "2+ weeks"];

export default function Step2({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const totalValue = (parseFloat(data.stakeRequired || "0") + parseFloat(data.reward || "0")).toFixed(2);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label hint="Held in escrow. Returned on completion.">Stake required (ETH) *</Label>
          <TextInput value={data.stakeRequired} onChange={(v) => set("stakeRequired", v)} placeholder="0.0" type="number" prefix="Ξ" />
          <Hint>Stake aligns incentives. Workers must lock this to apply.</Hint>
        </div>
        <div>
          <Label hint="Total payout on successful delivery.">Reward / payout (ETH) *</Label>
          <TextInput value={data.reward} onChange={(v) => set("reward", v)} placeholder="0.0" type="number" prefix="Ξ" />
        </div>
      </div>

      {(data.stakeRequired || data.reward) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Stake locked",   value: `Ξ ${data.stakeRequired || "0"}`, color: "text-amber-300" },
            { label: "Reward payout",  value: `Ξ ${data.reward || "0"}`,        color: "text-emerald-300" },
            { label: "Total value",    value: `Ξ ${totalValue}`,                 color: "text-indigo-300" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-center">
              <p className={["text-sm font-bold", m.color].join(" ")}>{m.value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{m.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Estimated effort</Label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {EFFORT_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set("effort", e)}
                className={[
                  "px-2.5 py-2 rounded-xl border text-[11px] font-medium transition-all",
                  data.effort === e
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                    : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300",
                ].join(" ")}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Deadline *</Label>
          <TextInput value={data.deadline} onChange={(v) => set("deadline", v)} type="date" />
          <Hint>Workers will see days remaining, not the raw date.</Hint>
        </div>
      </div>

      <div>
        <Label hint="How many workers can be accepted for this task.">Open slots</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set("slots", String(Math.max(1, parseInt(data.slots) - 1)))}
            className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            −
          </button>
          <span className="text-sm font-bold text-white w-6 text-center">{data.slots}</span>
          <button
            type="button"
            onClick={() => set("slots", String(Math.min(20, parseInt(data.slots) + 1)))}
            className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            +
          </button>
          <span className="text-[11px] text-gray-600">
            {parseInt(data.slots) === 1 ? "Solo task" : `Up to ${data.slots} workers`}
          </span>
        </div>
      </div>
    </div>
  );
}