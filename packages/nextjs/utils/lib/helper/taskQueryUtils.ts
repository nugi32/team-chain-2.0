import { useCallback, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

//
// enums
//
export enum TaskStatus {
  NonExistent = 0,
  Created = 1,
  Active = 2,
  OpenRegistration = 3,
  InProgres = 4,
  Completed = 5,
  Cancelled = 6,
}

export enum SubmitStatus {
  NoneStatus = 0,
  Pending = 1,
  RevisionNeeded = 2,
  Accepted = 3,
}

//
// types
//
type TaskApiData = {
  _id?: string; // mongo

  id: string; // task field / match smart contract

  title: string;
  picture: string;
  owner: string;

  description: {
    header: string;
    summary: string;
    points: string[];
    footer: string;
  };
};

type MergedTask = TaskApiData & {
  onchain: any;
  submit?: any;
};

export const useTaskDataUtils = () => {
  // NOTE: The blockchain hooks (useTaskData from smartContractWrapper) can only be 
  // called at component level. This utility provides task data query helpers.
  // For blockchain task data, use useTaskData hook directly in components.
  
  const [tasks, setTasks] = useState<MergedTask[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch API tasks only (offchain data)
  const fetchApiTasks = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/tasks`);
    return res.data;
  };

  // Fetch and merge tasks (API only for now, blockchain data should be fetched at component level)
  const fetchAllTasks = useCallback(async () => {
    try {
      setLoading(true);

      const apiTasks = await fetchApiTasks();

      const merged = apiTasks.map((task: TaskApiData) => ({
        ...task,
        onchain: { exists: false },
        submit: null,
      }));

      setTasks(merged);
      return merged;
    } catch (err) {
      console.error("Error fetching tasks:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  //
  // single task
  //
  const getTaskById = (
    taskId: number
  ) =>
    tasks.find(
      t =>
        Number(t.id) ===
        taskId
    );

  //
  // offchain getters
  //
  const getTaskTitle = (
    id: number,
  ) =>
    getTaskById(id)?.title;

  const getTaskPicture = (
    id: number,
  ) =>
    getTaskById(id)?.picture;

  const getTaskOwner = (
    id: number,
  ) =>
    getTaskById(id)?.owner;

  const getTaskDescription = (
    id: number,
  ) =>
    getTaskById(id)
      ?.description;

  const getTaskHeader = (
    id: number,
  ) =>
    getTaskById(id)
      ?.description.header;

  const getTaskSummary = (
    id: number,
  ) =>
    getTaskById(id)
      ?.description.summary;

  const getTaskPoints = (
    id: number,
  ) =>
    getTaskById(id)
      ?.description.points;

  const getTaskFooter = (
    id: number,
  ) =>
    getTaskById(id)
      ?.description.footer;

  //
  // onchain
  //
  const getTaskReward = (
    id: number,
  ) =>
    getTaskById(id)
      ?.onchain.reward;

  const getTaskValue = (
    id: number,
  ) =>
    getTaskById(id)
      ?.onchain.value;

  const getTaskStatus = (
    id: number,
  ) =>
    getTaskById(id)
      ?.onchain.status;

  const getTaskDeadline = (
    id: number,
  ) =>
    getTaskById(id)
      ?.onchain.deadlineAt;

  const getSubmitStatus = (
    id: number,
  ) =>
    getTaskById(id)
      ?.submit?.status;

  //
  // filters
  //
  const activeTasks =
    useMemo(
      () =>
        tasks.filter(
          t =>
            t.onchain
              .status ===
            TaskStatus
              .Active ||
            t.onchain
              .status ===
            TaskStatus
              .InProgres,
        ),
      [tasks],
    );

  const reviewTasks =
    useMemo(
      () =>
        tasks.filter(
          t =>
            t.submit
              ?.status ===
            SubmitStatus.Pending ||
            t.submit
              ?.status ===
            SubmitStatus.RevisionNeeded,
        ),
      [tasks],
    );

  const completedTasks =
    useMemo(
      () =>
        tasks.filter(
          t =>
            t.onchain
              .status ===
            TaskStatus.Completed,
        ),
      [tasks],
    );

  const disputedTasks =
    useMemo(
      () =>
        tasks.filter(
          t =>
            t.onchain &&
            !t.onchain
              .isRewardClaimed &&
            Number(
              t.onchain
                .deadlineAt,
            ) <
            Date.now() /
            1000,
        ),
      [tasks],
    );

  return {
    loading,
    tasks,

    fetchAllTasks,

    getTaskById,

    getTaskTitle,
    getTaskPicture,
    getTaskOwner,

    getTaskDescription,
    getTaskHeader,
    getTaskSummary,
    getTaskPoints,
    getTaskFooter,

    getTaskReward,
    getTaskValue,
    getTaskStatus,
    getTaskDeadline,
    getSubmitStatus,

    activeTasks,
    reviewTasks,
    completedTasks,
    disputedTasks,
  };
};