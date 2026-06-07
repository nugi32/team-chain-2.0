import { handleDelleteAccount } from "@/utils/lib/express/mutations/users";
import { useState } from "react";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { useRouter } from "next/navigation";

export function useDangerSection() {
    const { actions } = useUsersContract();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteAccount = async (address: string) => {
        setLoading(true);
        setError(null);

        try {
            const jwt = await getValidJwt(address);
            
            // Call smart contract unregister
            await actions.handleUnregister();
            
            // Delete from database
            await handleDelleteAccount("",jwt, address);
            
            router.push("/");
        } catch (err: any) {
            console.error("Error deleting account:", err);
            setError(err.message || "Failed to delete account");
        } finally {
            setLoading(false);
        }
    };

    return {
        handleDeleteAccount,
        loading,
        error,
    };
}