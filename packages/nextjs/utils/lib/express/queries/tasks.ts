import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface Task {
  _id: string;
  id: string;
  contractId: string;
  projectName: string;
  objective: string;
  category: string;
  effort: string;
  minReputation: string;
  roles: string[];
  skills: string[];
  description: string;
  badges: string[];
  milestones: unknown | null; // replace with a proper type if known
  stakeRequired: string;
  owner: string;
}

export async function getAllTasks() {
  try {
    const { data } = await axios.get<Task[]>(`${BASE_URL}/api/tasks`);
    return data;
  } catch (err) {
    console.error(`error while fetch all task data, error message : ${err}`);
    throw err;
  }
}

export async function getTaskBySmartContractId(_id: string) {
  try {
    if (!_id) {
      throw new Error("task ID not found");
    }

    const tasks = await getAllTasks();

    const task = tasks.find(task => task.contractId === _id);

    if (!task) {
      // Silently return undefined if task not found - this is expected during data loading
      return undefined;
    }

    return task; //Type 'Task | undefined' is not assignable to type 'Task'.Type 'undefined' is not assignable to type 'Task'.
  } catch (err) {
    // Silently handle errors during task fetching - return undefined
    return undefined;
  }
}

export async function getTaskById(_id: string) {
  try {
    if (!_id) {
      throw new Error("error id not found");
    }

    const { data } = await axios.get<Task>(`${BASE_URL}/api/tasks/${_id}`);
    return data;
  } catch (err) {
    console.error(`error while fetch all task data, error message : ${err}`);
    throw err;
  }
}
