"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, GitBranch, Menu, X,
  Clock, UserCheck, MessageSquare, AlertTriangle, CheckCheck,
  Settings, LogOut, User, Mail, LayoutDashboard, ChevronRight,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { hardhat } from "viem/chains";
import { handleFetchUserHeader } from "@/utils/lib/header";

import Image from "next/image";
import defaultProfile from "@/public/defaultProfile.jpg";
import { useParams } from "next/navigation";

/* ─────────────────────────────────────
   TYPES & DATA
────────────────────────────────────── */
type NotifType = "deadline" | "review" | "invite" | "dispute" | "welcome" | "announcement" | "info" | "update";

interface Notification {
  id: number;
  type: NotifType;
  msg: string;
  time: string;
  urgent: boolean;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "welcome",
    msg: "Welcome to Team Chain — the future of on-chain freelancing.",
    time: "Just now",
    urgent: false,
    read: false,
  },
  {
    id: 2,
    type: "announcement",
    msg: "Team Chain is currently operating on Testnet for public testing.",
    time: "Just now",
    urgent: true,
    read: false,
  },
  {
    id: 3,
    type: "info",
    msg: "All transactions and project activities use testnet assets only.",
    time: "1h ago",
    urgent: false,
    read: false,
  },
  {
    id: 4,
    type: "update",
    msg: "Explore projects, collaborate with teams, and test platform features.",
    time: "4h ago",
    urgent: false,
    read: false,
  },
];


const NOTIF_META: Record<NotifType, { icon: React.ReactNode; color: string }> = {
  deadline: { icon: <Clock className="w-3.5 h-3.5" />, color: "text-red-400    bg-red-500/10" },
  review: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-amber-400  bg-amber-500/10" },
  invite: { icon: <UserCheck className="w-3.5 h-3.5" />, color: "text-indigo-400 bg-indigo-500/10" },
  dispute: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-orange-400 bg-orange-500/10" },
  welcome: { icon: <User className="w-3.5 h-3.5" />, color: "text-green-400 bg-green-500/10" },
  announcement: { icon: <LayoutDashboard className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-500/10" },
  info: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-cyan-400 bg-cyan-500/10" },
  update: { icon: <Settings className="w-3.5 h-3.5" />, color: "text-purple-400 bg-purple-500/10" },
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", requiresUserId: true },
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
      <div className="px-4 py-2.5 border-t border-gray-800" />
    </motion.div>
  );
}

/* ─────────────────────────────────────
   PROFILE DROPDOWN  ← new
────────────────────────────────────── */
function ProfileDropdown({
  name,
  email,
  githubUrl,
  profilePicture,
  userId,
  onClose,
  onLogout,
}: {
  name: string;
  email: string;
  githubUrl: string;
  profilePicture: string;
  userId: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  // "John Doe" → "JD"
  const initials = name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // strip https://github.com/ to show just the handle
  const githubHandle = githubUrl
    ? githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "@")
    : null;

  type MenuItem = {
    icon: React.ReactNode;
    label: string;
    href?: string;
    danger?: boolean;
    onClick?: () => void;
  };

  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      label: "Dashboard",
      href: `/dashboard/${userId}`,
    },
    {
      icon: <Settings className="w-3.5 h-3.5" />,
      label: "Settings",
      href: `/settings/${userId}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 z-50 w-[248px] rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Identity block ── */}
      <div className="px-4 py-3.5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-indigo-300 text-sm font-bold leading-none">
                {initials || "?"}
              </span>
            )}
          </div>

          {/* Text info */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-100 truncate leading-tight">
              {name || "Anonymous"}
            </p>

            {email && (
              <p className="text-[10px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                {email}
              </p>
            )}

            {githubHandle && (
              <p className="text-[10px] text-indigo-400/80 truncate flex items-center gap-1 mt-0.5">
                <FaGithub className="w-2.5 h-2.5 flex-shrink-0" />
                {githubHandle}
              </p>
            )}
          </div>
        </div>

        {/* Online status pill */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[10px] text-emerald-400/80 font-medium">Online</span>
        </div>
      </div>

      {/* ── Menu items ── */}
      <div className="py-1.5">
        {menuItems.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors group"
            >
              <span className="text-gray-500 group-hover:text-indigo-400 transition-colors">
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-gray-500 transition-colors" />
            </Link>
          ) : (
            <button
              key={item.label}
              onClick={() => { item.onClick?.(); onClose(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors group"
            >
              <span className="text-gray-500 group-hover:text-indigo-400 transition-colors">
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          )
        )}
      </div>

      {/* ── Divider + Logout ── */}
      <div className="border-t border-gray-800 py-1.5">
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Log out</span>
        </button>
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
              active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900",
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
  const router = useRouter();
  const params = useParams();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);   // ← new
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);          // ← new

  const [profilePicture, setProfilePicture] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");  // ← new
  const [userGithub, setUserGithub] = useState<string>("");  // ← new
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("userId") || params.id as string;
    if (!id) { console.warn("cannot get user id from localStorage"); return; }
    setUserId(id);

    const fetchProfile = async () => {
      try {
        const result = await handleFetchUserHeader(id);
        setProfilePicture(result.profilePicture);
        setUserName(result.name);
        setUserEmail(result.email);      // ← new
        setUserGithub(result.githubUrl); // ← new
      } catch (err) {
        console.error(`err fetching user header: ${err}`);
      }
    };
    fetchProfile();
  }, []);

  /* Close notif panel on outside click */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  /* Close mobile menu on resize to desktop */
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.urgent && !n.read).length;

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const handleLogout = () => {
    localStorage.clear();           // wipe all local storage
    router.push("/");               // redirect to landing
  };

  /* Close other panels when one opens */
  const openProfile = () => { setProfileOpen((p) => !p); setNotifOpen(false); setMobileOpen(false); };
  const openNotif = () => { setNotifOpen((p) => !p); setProfileOpen(false); setMobileOpen(false); };
  const openMobile = () => { setMobileOpen((p) => !p); setNotifOpen(false); setProfileOpen(false); };

  return (
    <header className="relative border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Team Chain</span>
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] text-amber-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Testnet
          </div>
        </Link>

        {/* ── Nav (desktop, centered) ── */}
        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const href = "requiresUserId" in link && link.requiresUserId
              ? `/dashboard/${userId}`
              : link.href;
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={link.label}
                href={href}
                className={[
                  "relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  active ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-gray-900",
                ].join(" ")}
              >
                {link.label}
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
              onClick={openNotif}
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
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
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
            onClick={openMobile}
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

          {/* ── Avatar + Profile dropdown ── */}
          <div ref={profileRef} className="relative hidden sm:block">
            <button
              onClick={openProfile}
              aria-label="Profile menu"
              className={[
                "w-8 h-8 rounded-xl border flex items-center justify-center overflow-hidden transition-colors flex-shrink-0",
                profileOpen
                  ? "border-indigo-500/60 ring-2 ring-indigo-500/30"
                  : "border-indigo-500/30 bg-indigo-500/20 hover:border-indigo-500/50",
              ].join(" ")}
            >
              <Image
                src={profilePicture || defaultProfile}
                alt="Profile picture"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <ProfileDropdown
                  name={userName}
                  email={userEmail}
                  githubUrl={userGithub}
                  profilePicture={profilePicture}
                  userId={userId}
                  onClose={() => setProfileOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>
          </div>

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