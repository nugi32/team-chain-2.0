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

        console.log("=== INPUT ADDRESS ===");
        console.log("raw:", walletAddress);
        console.log("json:", JSON.stringify(walletAddress));
        console.log("type:", typeof walletAddress);
        console.log("length:", walletAddress.length);

        const normalizedInput = String(walletAddress)
            .trim()
            .replace(/\s/g, "")
            .toLowerCase();

        console.log("normalized:", normalizedInput);

        console.log("=== USERS ===");
        console.log(users);

        users.forEach((user, index) => {
            const dbAddress = String(user.walletAddress);
            const normalizedDb = dbAddress
                .trim()
                .replace(/\s/g, "")
                .toLowerCase();

            console.log(`\n=== USER ${index} ===`);
            console.log("db raw:", dbAddress);
            console.log("db json:", JSON.stringify(dbAddress));
            console.log("db type:", typeof user.walletAddress);
            console.log("db length:", dbAddress.length);

            console.log("db normalized:", normalizedDb);
            console.log("input normalized:", normalizedInput);

            console.log(
                "equal:",
                normalizedDb === normalizedInput
            );

            console.log(
                "char codes db:",
                [...dbAddress].map((c) => c.charCodeAt(0))
            );

            console.log(
                "char codes input:",
                [...walletAddress].map((c) => c.charCodeAt(0))
            );
        });

        const user = users.find((user) => {
            const dbAddress = String(user.walletAddress)
                .trim()
                .replace(/\s/g, "")
                .toLowerCase();

            return dbAddress === normalizedInput;
        });

        console.log("=== MATCHED USER ===");
        console.log(user);

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