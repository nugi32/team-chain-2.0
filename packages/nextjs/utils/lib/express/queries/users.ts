import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface User {
    _id: string,
    walletAddress: string,
    name: string,
    email: string,
    github: string,
    linkedin: string,
    role: string,
    profilePicture: string,
    description: {
        header: string,
        summary: string,
        points: string[],
        footer: string,
    },
    owner: string,
}

export async function getAllUsers() {
    try {
        const { data } = await axios.get<User[]>(`${BASE_URL}/api/users`);
        return data;
    } catch (err) {
        console.error(`error while fetch all user data, error message : ${err}`);
        throw err;
    }
}

export async function getUserById(_id: string) {
    try {
        if (!_id) {
            throw new Error("error id not found");
        }

        const { data } = await axios.get<User>(`${BASE_URL}/api/users/${_id}`);
        return data;
    } catch (err) {
        console.error(`error while fetch all user data, error message : ${err}`);
        throw err;
    }
}