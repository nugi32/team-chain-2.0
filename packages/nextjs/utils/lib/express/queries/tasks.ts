import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface Task {
    _id: string,
    smartContractId: number,
    title: string,
    description: {
        header: string,
        summary: string,
        points: string[],
        footer: string,
    },
    picture: string,
    owner: string,
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

export async function getTaskBySmartContractId(
    _id: string) {
    try {
        if (!_id) {
            throw new Error("task ID not found");
        }

        const tasks = await getAllTasks();

        const task = tasks.find(
            (task) =>
                task._id === _id
        );

        if (!task) {
            console.error("task not found");
        }

        return task; //Type 'Task | undefined' is not assignable to type 'Task'.Type 'undefined' is not assignable to type 'Task'.
    } catch (err) {
        console.error(
            `error while fetching task by ID, error message: ${err}`
        );
        throw err;
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