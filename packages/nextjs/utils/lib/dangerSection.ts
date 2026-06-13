import { handleDelleteAccount } from "@/utils/lib/express/mutations/users";
import { useState } from "react";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import { useRouter } from "next/navigation";

export function useDangerSection() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [userId, setUserId] = useState("");


    const handleDeleteAccount = async (address: string) => {
        setLoading(true);
        setError(null);

        try {
            const jwt = await getValidJwt(address);
            await handleDelleteAccount(userId, jwt, address);

            router.push("/");
        } catch (err: any) {
            console.error("Error deleting account:", err);
            setError(err.message || "Failed to delete account");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        handleDeleteAccount,
        loading,
        error,
        userId,
        setUserId,
    };
}