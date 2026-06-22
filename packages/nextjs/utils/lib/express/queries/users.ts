import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export interface User {
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
    skills: string[],
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

export async function getUserByAddress(
    walletAddress: string
): Promise<User> {
    try {
        if (!walletAddress) {
            throw new Error("wallet address not found");
        }

        const users = await getAllUsers();

        const normalizedInput = walletAddress
            .trim()
            .replace(/\s/g, "")
            .toLowerCase();

        const user = users.find((user) => {
            const normalizedDb = user.walletAddress
                .trim()
                .replace(/\s/g, "")
                .toLowerCase();

            return normalizedDb === normalizedInput;
        });

        if (!user) {
            throw new Error("user not found");
        }

        return user;
    } catch (err) {
        console.error(
            `error while fetching user by wallet address, error message: ${err}`
        );
        throw err;
    }
}

export async function getStartedFindUserByAddress(
    walletAddress: string) {
    try {
        if (!walletAddress) {
            throw new Error("wallet address not found");
        }

        const users = await getAllUsers();

        const user = users.find(
            (user) =>
                user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );

        if (!user) {
            console.error("user not found");
        }

        return user; //Type 'User | undefined' is not assignable to type 'User'.Type 'undefined' is not assignable to type 'User'.
    } catch (err) {
        console.error(
            `error while fetching user by wallet address, error message: ${err}`
        );
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