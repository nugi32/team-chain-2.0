import React from "react";
import { Wallet, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface WalletConnectBlockProps {
  walletAddress: string | null;
  walletLoading: boolean;
  walletError: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletConnectBlock({
  walletAddress,
  walletLoading,
  walletError,
  onConnect,
  onDisconnect,
}: WalletConnectBlockProps) {
  return (
    <section className="mb-3">
      <div
        className={[
          "rounded-3xl border p-6 transition-all duration-300",
          walletAddress
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-indigo-500/40 bg-indigo-500/5",
        ].join(" ")}
      >
        <div className="flex items-start gap-4">
          <div
            className={[
              "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
              walletAddress ? "bg-emerald-500/20" : "bg-indigo-500/20",
            ].join(" ")}
          >
            {walletAddress ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Wallet className="w-5 h-5 text-indigo-300" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-sm">
                  {walletAddress
                    ? "Wallet Connected"
                    : "Connect Wallet — Required"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {walletAddress ? (
                    <span className="font-mono text-emerald-400">
                      {walletAddress}
                    </span>
                  ) : (
                    "Your wallet signs the profile creation transaction. A small gas fee (~$0.01–$0.05) is deducted from your connected wallet."
                  )}
                </p>
              </div>

              {!walletAddress && (
                <button
                  type="button"
                  onClick={onConnect}
                  disabled={walletLoading}
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-4 py-2 text-sm font-medium transition-colors"
                >
                  {walletLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </>
                  )}
                </button>
              )}

              {walletAddress && (
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            {walletError && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {walletError}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}