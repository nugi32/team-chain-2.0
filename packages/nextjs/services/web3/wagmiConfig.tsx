import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig, { DEFAULT_ALCHEMY_API_KEY, ScaffoldConfig } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors(),
  ssr: true,
  client({ chain }) {
    // Extra fallback for mainnet.
    const mainnetFallbackWithDefaultRPC = [http("https://mainnet.rpc.buidlguidl.com", { timeout: 15000 })];
    let rpcFallbacks = [
      ...(chain.id === mainnet.id ? mainnetFallbackWithDefaultRPC : []),
      http(undefined, { timeout: 15000 }),
    ];

    const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id];

    if (rpcOverrideUrl) {
      rpcFallbacks = [http(rpcOverrideUrl, { timeout: 15000 }), ...rpcFallbacks];
    } else {
      const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
      if (alchemyHttpUrl) {
        const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
        // If using default Scaffold-ETH 2 API key, we prioritize the default RPC
        rpcFallbacks = isUsingDefaultKey
          ? [...rpcFallbacks, http(alchemyHttpUrl, { timeout: 15000 })]
          : [http(alchemyHttpUrl, { timeout: 15000 }), ...rpcFallbacks];
      }
    }

    return createClient({
      chain,
      transport: fallback(rpcFallbacks),
      ...(chain.id !== (hardhat as Chain).id
        ? {
            // Use longer polling intervals for testnet/mainnet to avoid rate limiting
            // Testnet: 8000ms, Mainnet: 12000ms
            pollingInterval: chain.id === 1 ? 12000 : 8000,
          }
        : {}),
    });
  },
});
