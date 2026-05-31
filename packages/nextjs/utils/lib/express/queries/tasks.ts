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
        console.error(`error while fetch all user data, error message : ${err}`);
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
        console.error(`error while fetch all user data, error message : ${err}`);
        throw err;
    }
}