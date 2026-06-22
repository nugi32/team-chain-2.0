// utils/lib/dashboard/useSubmitStatuses.ts

import { useEffect, useRef, useState } from "react";
import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";

/**
 * WHY THIS HOOK EXISTS
 * --------------------
 * `useGetTaskData()` exposes `ensureTaskId(taskId)` which calls `form.setId(...)`
 * to point the underlying `useTaskData()` hook at a given task, then returns
 * `data`. That works fine when called during a normal render. It does NOT work
 * reliably when called from inside an `async` function living inside a
 * `useEffect` (like the old `mapTasksToKanbanTasks` flow), because:
 *
 *   1. `form.setId(taskId)` triggers a re-render of whichever component owns
 *      the `useTaskData()` instance.
 *   2. The async function's closure over `data`/`loading` was captured BEFORE
 *      that re-render happened, and never gets reassigned — it's frozen.
 *   3. So polling `loading[fieldName]` inside that closure can see a stale
 *      "not loading" state and resolve too early, handing back default/empty
 *      contract data instead of the real fetched values.
 *
 * This hook sidesteps the whole problem: it calls `useTaskData()` directly,
 * sets the id, and reads the result INSIDE React's normal render/effect cycle
 * for the lifetime of this hook instance — so there's no closure to go stale.
 * It processes taskIds one at a time (mirroring the original "sequential to
 * avoid races" constraint) and exposes a plain `Record<number, number>` you
 * can pass straight into the mapper as ordinary data.
 */

export type SubmitStatusMap = Record<number, number>;

interface UseSubmitStatusesResult {
  /** taskId -> raw submitStatus number (0=NoneStatus,1=Pending,2=RevisionNeeded,3=Accepted) */
  submitStatusById: SubmitStatusMap;
  /** true while still walking through the taskIds list */
  isLoading: boolean;
}

/**
 * Fetches submitStatus for each taskId in `taskIds`, one at a time, using a
 * single shared `useTaskData()` instance owned by THIS hook (so its `data`/
 * `loading` are always the live, current-render values — never a frozen
 * snapshot).
 *
 * Call this at the top of your page/component, alongside (not inside) your
 * mapping logic, then pass `submitStatusById` into the mapper as plain data.
 */
export function useSubmitStatuses(taskIds: number[]): UseSubmitStatusesResult {
  const { form, data, loading } = useTaskData();

  const [submitStatusById, setSubmitStatusById] = useState<SubmitStatusMap>({});
  const [cursor, setCursor] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Stable key so we only restart the walk when the actual set of ids changes,
  // not on every re-render (taskIds is usually a freshly-built array each render).
  const idsKey = taskIds.join(",");
  const idsKeyRef = useRef(idsKey);
  const resultRef = useRef<SubmitStatusMap>({});

  // Reset the walk whenever the underlying set of taskIds actually changes.
  useEffect(() => {
    if (idsKeyRef.current === idsKey) return;
    idsKeyRef.current = idsKey;
    resultRef.current = {};
    setSubmitStatusById({});
    setCursor(0);
  }, [idsKey]);

  // Step 1: point useTaskData at the current cursor's taskId.
  useEffect(() => {
    if (taskIds.length === 0) {
      setIsLoading(false);
      return;
    }
    if (cursor >= taskIds.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const taskId = taskIds[cursor];
    form.setId(BigInt(taskId));
    // We deliberately do NOT read `data.submitStatus` here — we wait for the
    // next effect (keyed on `loading.submitStatus`) to fire once the contract
    // read actually settles for this taskId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, idsKey, taskIds.length]);

  // Step 2: once loading.submitStatus flips back to false for the current
  // cursor's taskId, record the value and advance to the next taskId.
  useEffect(() => {
    if (taskIds.length === 0 || cursor >= taskIds.length) return;
    if (loading.submitStatus) return; // still fetching this task — wait

    const taskId = taskIds[cursor];
    const raw = data.submitStatus;
    const value =
      raw === undefined || raw === null ? 0 : Number(raw as unknown as number);

    resultRef.current = { ...resultRef.current, [taskId]: value };
    setSubmitStatusById(resultRef.current);

    setCursor((c) => c + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading.submitStatus, data.submitStatus, cursor, idsKey, taskIds.length]);

  return { submitStatusById, isLoading };
}