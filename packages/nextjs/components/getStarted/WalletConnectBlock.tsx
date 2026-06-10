"use client";

import React, { useRef, useEffect } from "react";
import {
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeftRight,
} from "lucide-react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useSwitchChain, useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";

/**
 * Wallet connection block scoped to Sepolia.
 *
 * Wagmi / RainbowKit config must include sepolia in its chains array, e.g.:
 *   import { sepolia } from "wagmi/chains";
 *   createConfig({ chains: [sepolia], ... })
 *   <RainbowKitProvider initialChain={sepolia}>
 */
export default function WalletConnectBlock() {
  const disconnectedRef = useRef(false);

 const { disconnect } = useDisconnect();

  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const { address: connectedAddress, isConnected } = useAccount();

  const chainId = useChainId();

  const isConnectedToSepolia =
    isConnected && chainId === sepolia.id;

  useEffect(() => {
    if (
      connectedAddress &&
      chainId !== sepolia.id &&
      switchChain
    ) {
      console.log("Not connected to Sepolia, switching...");

      switchChain({
        chainId: sepolia.id,
      });
    }
  }, [connectedAddress, chainId, switchChain]);


  const disconnectWallet = () => {
    if (disconnectedRef.current) return;
    disconnectedRef.current = true;
    try {
      localStorage.removeItem("wagmi.store");
      localStorage.removeItem("rk-connected-wallets");
      sessionStorage.clear();
      disconnect();
    } catch (err) {
      console.log(err);
    }
    setTimeout(() => { disconnectedRef.current = false; }, 500);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected     = mounted && !!account && !!chain;
        const wrongNetwork  = connected && chain.id !== sepolia.id;
        const allGood       = connected && !wrongNetwork;

        // Border / background token per state
        const borderBg = wrongNetwork
          ? "border-amber-500/40   bg-amber-500/5"
          : allGood
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-indigo-500/40  bg-indigo-500/5";

        // Icon container token per state
        const iconBg = wrongNetwork
          ? "bg-amber-500/20"
          : allGood
          ? "bg-emerald-500/20"
          : "bg-indigo-500/20";

        const icon = wrongNetwork
          ? <AlertCircle  className="w-5 h-5 text-amber-400"   />
          : allGood
          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          : <Wallet       className="w-5 h-5 text-indigo-300"  />;

        const title = wrongNetwork
          ? "Wrong Network"
          : allGood
          ? "Wallet Connected"
          : "Connect Wallet — Required";

        return (
          <section className="mb-3">
            <div className={`rounded-3xl border p-6 transition-all duration-300 ${borderBg}`}>
              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Left: title + subtitle */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{title}</p>

                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {wrongNetwork ? (
                          <span className="text-amber-400">
                            This app requires <span className="font-semibold">Sepolia</span>.
                            Switch networks to continue.
                          </span>
                        ) : allGood ? (
                          <span className="font-mono text-emerald-400 break-all">
                            {account.address}
                          </span>
                        ) : (
                          "Your wallet signs the profile creation transaction. A small gas fee (~$0.01–$0.05) is deducted from your connected wallet."
                        )}
                      </p>
                    </div>

                    {/* Right: action button(s) */}
                    <div className="flex items-center gap-3 flex-shrink-0">

                      {/* Not connected */}
                      {!connected && (
                        <button
                          type="button"
                          onClick={openConnectModal}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-sm font-medium transition-colors"
                        >
                          <Wallet className="w-4 h-4" />
                          Connect Wallet
                        </button>
                      )}

                      {/* Wrong network → switch directly to Sepolia */}
                      {wrongNetwork && (
                        <button
                          type="button"
                          onClick={() => switchChain({ chainId: sepolia.id })}
                          disabled={isSwitching}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 px-4 py-2 text-sm font-medium transition-colors"
                        >
                          {isSwitching ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Switching…</>
                          ) : (
                            <><ArrowLeftRight className="w-4 h-4" /> Switch to Sepolia</>
                          )}
                        </button>
                      )}

                      {/* Connected on correct network */}
                      {allGood && (
                        <>
                          {/* Network pill */}
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {chain.name}
                          </span>

                          <button
                            type="button"
                            onClick={disconnectWallet}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }}
    </ConnectButton.Custom>
  );
}