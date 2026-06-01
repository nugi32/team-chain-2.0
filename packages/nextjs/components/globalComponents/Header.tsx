"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, GitBranch, Menu, X,
  Clock, UserCheck, MessageSquare, AlertTriangle, CheckCheck,
} from "lucide-react";

import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { hardhat } from "viem/chains";
import { handleFetchUserHeader } from "@/utils/lib/header";

import Image from "next/image";

import defaultProfile from "@/public/defaultProfile.jpg";

/* ─────────────────────────────────────
   TYPES & DATA
────────────────────────────────────── */
type NotifType = "deadline" | "review" | "invite" | "dispute";

interface Notification {
  id: number;
  type: NotifType;
  msg: string;
  time: string;
  urgent: boolean;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "deadline", msg: "DAO Governance Module overdue", time: "Just now", urgent: true, read: false },
  { id: 2, type: "review", msg: "2 approvals pending on Cross-Chain Oracle", time: "4h ago", urgent: false, read: false },
  { id: 3, type: "invite", msg: "Invited to join ZK Rollup SDK", time: "1d ago", urgent: false, read: false },
  { id: 4, type: "dispute", msg: "L2 Bridge dispute awaiting arbitration", time: "2d ago", urgent: true, read: false },
];

const NOTIF_META: Record<NotifType, { icon: React.ReactNode; color: string }> = {
  deadline: { icon: <Clock className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-500/10" },
  review: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-amber-400 bg-amber-500/10" },
  invite: { icon: <UserCheck className="w-3.5 h-3.5" />, color: "text-indigo-400 bg-indigo-500/10" },
  dispute: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-orange-400 bg-orange-500/10" },
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Explore", href: "/explore" },
  { label: "How It Works", href: "/howItWorks" },
] as const;

/* ─────────────────────────────────────
   NOTIFICATION PANEL
────────────────────────────────────── */
function NotificationPanel({
  notifications,
  onMarkAllRead,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: number) => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 z-50 w-[340px] rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-gray-200">Notifications</p>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded-full px-1.5 py-0.5">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <CheckCheck className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Items */}
      <div className="max-h-[340px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-6 h-6 text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-600">You're all caught up</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = NOTIF_META[n.type];
            return (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={[
                  "w-full text-left px-4 py-3 border-b border-gray-800/60 flex items-start gap-3",
                  "hover:bg-gray-800/50 transition-colors",
                  !n.read ? "bg-gray-800/20" : "opacity-55",
                ].join(" ")}
              >
                <div className={["w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", meta.color].join(" ")}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={["text-xs leading-snug", !n.read ? "text-gray-200" : "text-gray-400"].join(" ")}>
                    {n.msg}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{n.time}</p>
                </div>
                {!n.read && (
                  <div className={["w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5",
                    n.urgent ? "bg-red-400" : "bg-indigo-400"].join(" ")} />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Panel footer */}
      <div className="px-4 py-2.5 border-t border-gray-800">
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   MOBILE MENU
────────────────────────────────────── */
function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/98 backdrop-blur-md px-4 py-3 flex flex-col gap-1"
    >
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={[
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-900",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="mt-3 pt-3 border-t border-gray-800/60 flex flex-col gap-2">
        <RainbowKitCustomConnectButton />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   HEADER
────────────────────────────────────── */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);

  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("userId");

    if (!id) {
      console.warn("cannot get user id from localStorage");
      return;
    }

    setUserId(id);

    const fetchProfilePict = async () => {
      try {
        const result = await handleFetchUserHeader(id);

        setProfilePicture(result.profilePicture);
        setUserInitials(result.name);

        console.log(result);
      } catch (err) {
        console.error(
          `err while getting user profile picture. err message: ${err}`
        );
      }
    };

    fetchProfilePict();
  }, []);

  /* Close notification panel on outside click */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  /* Close mobile menu on resize to desktop */
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.urgent && !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <header className="relative border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Team Chain</span>
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] text-indigo-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Mainnet
          </div>
        </Link>

        {/* ── Nav (desktop, centered) ── */}
        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  active ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-gray-900",
                ].join(" ")}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-gray-800 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Faucet — desktop only */}
          <div className="hidden lg:block">
            {isLocalNetwork && <FaucetButton />}
          </div>

          {/* Wallet — desktop only */}
          <div className="hidden md:flex items-center rounded-xl border border-gray-800 bg-gray-900 px-2 py-1">
            <RainbowKitCustomConnectButton />
          </div>

          {/* Notification bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen((p) => !p); setMobileOpen(false); }}
              aria-label="Notifications"
              className={[
                "relative w-8 h-8 rounded-xl border flex items-center justify-center transition-colors",
                notifOpen
                  ? "border-indigo-500/50 bg-indigo-500/10"
                  : "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/50",
              ].join(" ")}
            >
              <Bell className={["w-4 h-4 transition-colors", notifOpen ? "text-indigo-400" : "text-gray-400"].join(" ")} />

              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={[
                      "absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[9px] flex items-center justify-center font-bold px-0.5",
                      urgentCount > 0 ? "bg-red-500 text-white" : "bg-indigo-500 text-white",
                    ].join(" ")}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {notifOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkAllRead={markAllRead}
                  onMarkRead={markRead}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMobileOpen((p) => !p); setNotifOpen(false); }}
            aria-label="Toggle menu"
            className="md:hidden w-8 h-8 rounded-xl border border-gray-800 bg-gray-900 flex items-center justify-center hover:border-gray-700 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}>
                  <X className="w-4 h-4 text-gray-400" />
                </motion.div>
              ) : (
                <motion.div key="menu"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.12 }}>
                  <Menu className="w-4 h-4 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* User initials avatar */}
          <Link href={`/settings/${userId}`} className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0 overflow-hidden">
              <Image
                src={profilePicture || defaultProfile}
                alt="Profile picture"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </Link>

        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu pathname={pathname} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

    </header>
  );
};