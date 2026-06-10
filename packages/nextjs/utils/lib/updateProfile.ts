import { handleUpdateAccount, type UpdateAccountPayload } from "@/utils/lib/express/mutations/users";
import { useState } from "react";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import { useRouter } from "next/navigation";

export function useUpdateProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleUpdateProfile = async (userId: string, address: string, formData: UpdateAccountPayload) => {
        setLoading(true);
        setError(null);

        try {
            const jwt = await getValidJwt(address);
            await handleUpdateAccount(userId, formData, jwt, address);

            router.refresh();
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError(err.message || "Failed to update profile");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        handleUpdateProfile,
        loading,
        error,
    };
}