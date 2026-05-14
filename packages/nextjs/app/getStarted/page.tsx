"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, User, ArrowLeft, ShieldCheck } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";

import { Button } from "@/components/globalComponents/button";
import { Card, CardContent } from "@/components/globalComponents/card";

import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";

import { useAccount, useDisconnect } from "wagmi";

import { notification } from "~~/utils/scaffold-eth";

export default function TeamChainLoginPage() {
  const router = useRouter();

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [manualConnect, setManualConnect] = useState(false);

  // supaya disconnect cuma sekali saat page dibuka
  const disconnectedRef = useRef(false);

  /**
   * FORCE DISCONNECT
   * saat user buka halaman login
   */
  useEffect(() => {
    if (!disconnectedRef.current) {
      disconnectedRef.current = true;

      try {
        // clear wagmi cache
        localStorage.removeItem("wagmi.store");

        // clear rainbowkit cache
        localStorage.removeItem("rk-connected-wallets");

        // clear session
        sessionStorage.clear();

        // disconnect wallet
        disconnect();
      } catch (err) {
        console.log(err);
      }
    }
  }, [disconnect]);

  /**
   * REDIRECT SETELAH CONNECT
   * + COUNTDOWN
   * + CANCEL BUTTON
   */
  useEffect(() => {
    if (!manualConnect) return;

    let countdown = 5;
    let cancelled = false;

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const startRedirectFlow = async () => {
      if (isConnected && address) {
        console.log("Wallet connected:", address);

        // contoh API login
        // await fetch("/api/login", {
        //   method: "POST",
        //   body: JSON.stringify({ address }),
        // });

        const toastId = notification.info(
          <div className="flex flex-col gap-3 min-w-[250px]">
            <div className="text-sm leading-6">
              Wallet connected successfully.
              <br />
              Redirecting to dashboard in{" "}
              <span
                id="redirect-countdown"
                className="font-bold text-indigo-400"
              >
                {countdown}
              </span>
              s...
            </div>

            <button
              className="rounded-xl border border-red-500 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/20 transition"
              onClick={() => {
                cancelled = true;

                clearInterval(interval);
                clearTimeout(timeout);

                notification.remove(toastId);

                notification.warning("Redirect cancelled");

                // reset state
                setManualConnect(false);
              }}
            >
              Cancel Redirect
            </button>
          </div>,
          {
            duration: 6000,
          }
        );

        interval = setInterval(() => {
          countdown--;

          const el = document.getElementById("redirect-countdown");

          if (el) {
            el.innerText = countdown.toString();
          }
        }, 1000);

        timeout = setTimeout(() => {
          clearInterval(interval);

          if (!cancelled) {
            notification.remove(toastId);

            router.push("/dashboard");
          }
        }, 5000);
      }
    };

    startRedirectFlow();

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [manualConnect, isConnected, address, router]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-stretch">
        {/* LEFT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col justify-between rounded-3xl border border-gray-800 bg-gray-900 p-8"
        >
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-5 m-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Recommended authentication method
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-4">
              Access Team Chain
            </h1>

            <p className="text-gray-400 leading-7 max-w-md">
              Team Chain supports multiple authentication methods, but
              wallet-based login is the primary access layer for protocol
              participation.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5 mt-8">
            <h2 className="font-semibold mb-3 text-white">
              Why connect wallet?
            </h2>

            <ul className="space-y-3 text-sm text-gray-400 leading-6">
              <li>
                • Required to sign transactions, stake, vote, and claim rewards.
              </li>

              <li>
                • Wallet identity stores contribution history and protocol
                reputation.
              </li>

              <li>
                • GitHub or username login only provides read access to
                dashboards and public data.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-gray-900 border-gray-800 rounded-3xl shadow-2xl h-full">
            <CardContent className="p-8 md:p-10">
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Get Started
                </h2>

                <p className="text-sm text-gray-400 leading-6">
                  Choose your preferred sign-in method. For full protocol
                  interaction, wallet connection is required.
                </p>
              </div>

              <div className="space-y-4">
                {/* CONNECT WALLET */}
                <button
                  className="w-full rounded-2xl border border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors p-4 text-left group"
                  onClick={() => {
                    setManualConnect(true);
                    openConnectModal?.();
                  }}
                  type="button"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-indigo-500/20 p-2">
                      <Wallet className="w-5 h-5 text-indigo-300" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">
                          Connect Wallet
                        </span>

                        <span className="text-xs rounded-full border border-indigo-500/40 px-2 py-1 text-indigo-300">
                          Recommended
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mt-1 leading-6">
                        Full access: transactions, staking, governance voting,
                        rewards, and protocol actions.
                      </p>
                    </div>
                  </div>
                </button>

                {/* GITHUB */}
                <button className="w-full rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors p-4 text-left">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gray-800 p-2">
                      <FaGithub className="w-5 h-5 text-gray-300" />
                    </div>

                    <div>
                      <span className="font-medium">
                        Continue with GitHub
                      </span>

                      <p className="text-sm text-gray-400 mt-1 leading-6">
                        Read-only access for profile sync, public activity, and
                        team discovery.
                      </p>
                    </div>
                  </div>
                </button>
                
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-4">
                  New to Team Chain?
                </p>

                <Button
                  className="w-full rounded-2xl h-12"
                  onClick={() =>
                    (window.location.href = "/createAccount")
                  }
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}