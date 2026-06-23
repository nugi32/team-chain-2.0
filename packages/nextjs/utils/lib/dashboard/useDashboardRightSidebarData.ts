import { useEffect, useState } from "react";
import { useTargetNetwork } from "@/hooks/scaffold-eth";
import { getUserById } from "@/utils/lib/express/queries/users";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { useAccount } from "wagmi";

export const useDashboardRightSidebarData = (id?: string) => {
  const [walletAddress, setWalletAddress] = useState<string>("");

  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (isConnected && address) {
        setWalletAddress(address);
      } else if (id) {
        const userData = await getUserById(id);

        if (userData?.walletAddress) {
          setWalletAddress(userData.walletAddress);
        }
      }
    };

    fetchWalletAddress();
  }, [id, isConnected, address]);

  const { user } = useUsersContract(walletAddress);
  const { targetNetwork } = useTargetNetwork();

  return {
    balance: user?.balance,
    networkName: targetNetwork.name,
    address,
    walletAddress,
    user,
  };
};
