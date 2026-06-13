"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft, ShieldCheck } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";

import { LinkButton } from "@/components/globalComponents/LinkButton";
import { Card, CardContent } from "@/components/globalComponents/card";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

import { notification } from "~~/utils/scaffold-eth";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import { handleLogin } from "@/utils/lib/login";

// ---------------------------------------------------------------------------
// Countdown + redirect helper
// ---------------------------------------------------------------------------
function startCountdownRedirect({
  router,
  targetPath,
  onCancel,
}: {
  router: ReturnType<typeof useRouter>;
  targetPath: string;
  onCancel: () => void;
}) {
  let countdown = 5;
  let cancelled = false;
  let interval: NodeJS.Timeout;
  let timeout: NodeJS.Timeout;

  const toastId = notification.info(
    <div className="flex flex-col gap-3 min-w-[250px]">
      <div className="text-sm leading-6">
        Login successful.
        <br />
        Redirecting to dashboard in{" "}
        <span id="redirect-countdown" className="font-bold text-indigo-400">
          {countdown}
        </span>
        s…
      </div>

      <button
        className="rounded-xl border border-red-500 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/20 transition"
        onClick={() => {
          cancelled = true;
          clearInterval(interval);
          clearTimeout(timeout);
          notification.remove(toastId);
          notification.warning("Redirect cancelled");
          onCancel();
        }}
      >
        Cancel Redirect
      </button>
    </div>,
    { duration: 6000 }
  );

  interval = setInterval(() => {
    countdown--;
    const el = document.getElementById("redirect-countdown");
    if (el) el.innerText = countdown.toString();
  }, 1000);

  timeout = setTimeout(() => {
    clearInterval(interval);
    if (!cancelled) {
      notification.remove(toastId);
      router.push(targetPath);
    }
  }, 5000);

  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function TeamChainLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [activeMethod, setActiveMethod] = useState<"wallet" | "github" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const disconnectedRef = useRef(false);
  const githubHandledRef = useRef(false);
  const walletHandledRef = useRef(false);
  const clearedSessionRef = useRef(false); // prevent multiple signOut

  // -------------------------------------------------------------------------
  // 1. Force disconnect wallet caches (but DO NOT clear sessionStorage)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (disconnectedRef.current) return;
    disconnectedRef.current = true;

    try {
      localStorage.removeItem("wagmi.store");
      localStorage.removeItem("rk-connected-wallets");
      // JANGAN sessionStorage.clear() — nanti flag githubLoginPending hilang
      disconnect();
    } catch (err) {
      console.error(err);
    }
  }, [disconnect]);

    useEffect(() => {
      localStorage.clear();
    }, []);
  // -------------------------------------------------------------------------
  // 2. Clear GitHub OAuth session on page refresh
  //    (if already authenticated and not just after a login redirect)
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Hanya jalankan jika status authenticated dan belum ada flag pending
    // dan belum pernah menjalankan signOut (cegah loop)
    if (status === "authenticated" && !sessionStorage.getItem("githubLoginPending") && !clearedSessionRef.current) {
      clearedSessionRef.current = true;
      signOut({ redirect: false }).then(() => {
        console.log("GitHub OAuth session cleared on page refresh");
        notification.info("Session cleared. Please login again.");
        // Opsional: reload halaman untuk reset state sepenuhnya
        // window.location.reload();
      }).catch(err => console.error("SignOut error:", err));
    }
  }, [status]);

  // -------------------------------------------------------------------------
  // Handle successful login
  // -------------------------------------------------------------------------
  const handleSuccessfulLogin = useCallback(
    async (method: "wallet" | "github", identifier: string) => {
      if (!method) return;

      setIsLoading(true);

      try {
        const userId = await handleLogin(method, identifier);

        // simpan user id buat dipakai nanti
        localStorage.setItem("userId", userId);

        const cleanup = startCountdownRedirect({
          router,
          targetPath: `/dashboard/${userId}`,
          onCancel: () => {
            setActiveMethod(null);
            setIsLoading(false);
          },
        });

        return cleanup;
      } catch (err) {
        console.error("Login error:", err);

        notification.error("Login failed. Please try again.");

        setActiveMethod(null);
        setIsLoading(false);
      }
    },
    [router]
  );


  // -------------------------------------------------------------------------
  // WALLET trigger
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (activeMethod !== "wallet") return;
    if (!isConnected || !address) return;
    if (walletHandledRef.current) return;

    walletHandledRef.current = true;
    handleSuccessfulLogin("wallet", address);
  }, [activeMethod, isConnected, address, handleSuccessfulLogin]);

  // -------------------------------------------------------------------------
  // GITHUB trigger after OAuth redirect
  // -------------------------------------------------------------------------
  useEffect(() => {
    const githubPending = sessionStorage.getItem("githubLoginPending");
    if (!githubPending) return;
    if (status !== "authenticated") return;
    if (githubHandledRef.current) return;

    const username =
      (session?.user as { login?: string } | undefined)?.login ??
      session?.user?.name ??
      session?.user?.email ??
      "";

    if (!username) {
      console.warn("Username not found in session");
      return;
    }

    console.log("GitHub login detected, username:", username);
    githubHandledRef.current = true;
    sessionStorage.removeItem("githubLoginPending");
    setActiveMethod("github");
    handleSuccessfulLogin("github", username);
  }, [status, session, handleSuccessfulLogin]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-stretch">
        {/* LEFT PANEL - same as before */}
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
              <li>• Required to sign transactions, stake, vote, and claim rewards.</li>
              <li>• Wallet identity stores contribution history and protocol reputation.</li>
              <li>• GitHub or username login only provides read access to dashboards and public data.</li>
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
                <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
                <p className="text-sm text-gray-400 leading-6">
                  Choose your preferred sign-in method. For full protocol
                  interaction, wallet connection is required.
                </p>
              </div>

              <div className="space-y-4">
                {/* CONNECT WALLET */}
                <button
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors p-4 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    walletHandledRef.current = false;
                    setActiveMethod("wallet");
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
                        <span className="font-medium">Connect Wallet</span>
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
                <button
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    sessionStorage.setItem("githubLoginPending", "true");
                    signIn("github", { callbackUrl: "/login" }, { prompt: "select_account" });
                  }}
                  type="button"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gray-800 p-2">
                      <FaGithub className="w-5 h-5 text-gray-300" />
                    </div>

                    <div>
                      <span className="font-medium">Continue with GitHub</span>
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

                <LinkButton
                  className="w-full h-12 rounded-2xl"
                  href="/getStarted"
                >
                  Create Account
                </LinkButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}