import { useEffect } from "react";
import { motion } from "framer-motion";
import Label from "./Label";
import TextInput from "./TextInput";
import Hint from "./Hint";
import type { FormData } from "./types";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useWalletAddress } from "@/hooks/scaffold-eth";
import { formatEther, parseEther } from "ethers";

const EFFORT_OPTIONS = ["< 4 hrs", "4–8 hrs", "1–3 days", "1 week", "2+ weeks"];

function safeParseEther(value: string | undefined): bigint | undefined {
  if (!value) return undefined;
  try {
    const wei = parseEther(value);
    return wei > 0n ? wei : undefined;
  } catch {
    return undefined;
  }
}

export default function Step2({
  data,
  set,
}: {
  data: FormData;
  set: (k: keyof FormData, v: unknown) => void;
}) {
  const { walletAddress } = useWalletAddress();

  // ─── useTaskController replaces useTaskLifecycleLogic ──────────────────────
  // form.setDeadlineHours / setMaxRevision / setRewardWei feed into the
  // internal useScaffoldReadContract that calls ___getCreatorStake.
  // data.creatorStake is the result; loading.isCreatorStakeLoading is the flag.
  const { form, user, data: contractData, loading } = useTaskController();

  // ─── Derive args from FormData ──────────────────────────────────────────────
  const deadlineMs = data.deadline ? new Date(data.deadline).getTime() - Date.now() : null;
  const deadlineHours =
    deadlineMs !== null && deadlineMs > 3_600_000
      ? BigInt(Math.ceil(deadlineMs / 3_600_000))
      : undefined;

  const maximumRevision = data.maxRevisions
    ? BigInt(parseInt(data.maxRevisions))
    : undefined;

  const memberReward = safeParseEther(data.reward);

  // ─── Sync derived values into the hook's internal state ────────────────────
  // Must be useEffect — calling setters during render causes infinite loops.
  // Each setter only fires when its value actually changes.
  useEffect(() => {
    if (deadlineHours !== undefined) form.setDeadlineHours(deadlineHours);
  }, [deadlineHours]);

  useEffect(() => {
    if (maximumRevision !== undefined) form.setMaxRevision(maximumRevision);
  }, [maximumRevision]);

  useEffect(() => {
    // rewardWei is stored as string in the hook: BigInt(rewardWei) is used in args
    if (memberReward !== undefined) form.setRewardWei(memberReward.toString());
  }, [memberReward]);

  useEffect(() => {
    if (walletAddress) user.setCreatorStakeCaller(walletAddress as `0x${string}`);
  }, [walletAddress]);

  // ─── Map hook outputs to the same shape as old useTaskLifecycleLogic ────────
  const creatorRequiredStake = contractData.creatorStake;            // bigint | undefined
  const isTaskLoading        = loading.isCreatorStakeLoading;        // boolean
  const stakeError           = null;                                  // not exposed by useTaskController
  const contractFound        = true;                                  // scaffold handles missing contracts
  const enabled              = !!walletAddress && !!deadlineHours && !!maximumRevision && !!memberReward;
  // isStuck: all args ready, not loading, but still no result → call reverted silently
  const isStuck              = enabled && !isTaskLoading && creatorRequiredStake === undefined;

  // ─── Derived display values ─────────────────────────────────────────────────
  const missingArg = !walletAddress
    ? "wallet address"
    : !deadlineHours
      ? "a future deadline (must be > 1 hr from now)"
      : !maximumRevision
        ? "max revisions"
        : !memberReward
          ? "reward"
          : null;

  const reward = parseFloat(data.reward || "0");

  const requiredStake =
    creatorRequiredStake != null
      ? parseFloat(formatEther(creatorRequiredStake)).toFixed(4)
      : null;

  const totalValue =
    requiredStake != null ? (reward + parseFloat(requiredStake)).toFixed(4) : null;

  // ─── Stake field display ────────────────────────────────────────────────────
  const StakeValue = () => {
    if (!enabled) {
      return <span className="text-xs text-gray-600">Fill all fields first</span>;
    }
    if (!contractFound) {
      return (
        <span className="text-xs text-red-400">
          Contract not found — check deployedContracts.ts
        </span>
      );
    }
    if (isTaskLoading) {
      return (
        <span className="flex items-center gap-2 text-gray-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-600 border-t-amber-400" />
          Calculating…
        </span>
      );
    }
    if (stakeError) {
      return <span className="text-xs text-red-400">Contract error — see console</span>;
    }
    if (isStuck) {
      return (
        <span className="text-xs text-orange-400">
          Call reverted silently — check contract logs
        </span>
      );
    }
    return <span>Ξ {requiredStake ?? "0"}</span>;
  };

  const stakeHint = () => {
    if (!contractFound) return "TaskController not found in deployedContracts.ts for this chain.";
    if (stakeError) return `Contract error: ${(stakeError as Error | null)?.message ?? "unknown"}`;
    if (isStuck) return "Contract returned nothing. The call may have reverted — check that all inputs are valid.";
    if (missingArg) return `Waiting for ${missingArg}.`;
    return "Fetched live from the contract — locked until the task is resolved.";
  };

  // ─── Summary cards ──────────────────────────────────────────────────────────
  const hasError = isStuck || !!stakeError || !contractFound;

  const summaryCards = [
    {
      label: "Stake locked",
      value: !enabled || isTaskLoading ? "…" : hasError ? "Error" : `Ξ ${requiredStake}`,
      color: hasError ? "text-orange-400" : "text-amber-300",
    },
    {
      label: "Reward payout",
      value: `Ξ ${data.reward || "0"}`,
      color: "text-emerald-300",
    },
    {
      label: "Total value",
      value: !enabled || isTaskLoading ? "…" : hasError || totalValue == null ? "Error" : `Ξ ${totalValue}`,
      color: hasError ? "text-orange-400" : "text-indigo-300",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Row 1: Reward + Required stake ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label hint="Total payout on successful delivery.">
            Reward / payout (ETH) *
          </Label>
          <TextInput
            value={data.reward}
            onChange={(v) => set("reward", v)}
            placeholder="0.0"
            type="number"
            prefix="Ξ"
          />
        </div>

        <div>
          <Label hint="Required by the smart contract based on the reward amount.">
            Required stake
          </Label>
          <div className="flex h-11 items-center rounded-xl border border-gray-800 bg-gray-900/60 px-4 font-medium text-amber-300">
            <StakeValue />
          </div>
          <Hint>{stakeHint()}</Hint>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {reward > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="grid grid-cols-3 gap-3"
        >
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-center"
            >
              <p className={["text-sm font-bold", card.color].join(" ")}>{card.value}</p>
              <p className="mt-0.5 text-[10px] text-gray-600">{card.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Row 2: Effort / Deadline / Max revisions ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div>
          <Label>Estimated effort</Label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {EFFORT_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set("effort", e)}
                className={[
                  "rounded-xl border px-2.5 py-2 text-[11px] font-medium transition-all",
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
          <TextInput
            value={data.deadline}
            onChange={(v) => set("deadline", v)}
            type="date"
          />
          <Hint>
            {deadlineMs !== null && deadlineMs <= 3_600_000 && data.deadline
              ? "⚠ Deadline must be at least 1 hour in the future."
              : "Workers will see days remaining, not the raw date."}
          </Hint>
        </div>

        <div>
          <Label hint="Maximum number of revision requests allowed.">Max revisions</Label>
          <TextInput
            value={data.maxRevisions}
            onChange={(v) => set("maxRevisions", v)}
            placeholder="3"
            type="number"
          />
          <Hint>
            Set how many revision rounds the worker must accommodate before the task can
            be accepted or disputed.
          </Hint>
        </div>
      </div>
    </div>
  );
}