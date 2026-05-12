"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GitBranch,
  MessageCircle,
  Send,
  ArrowUpRight,
  Shield,
  Zap,
  Users,
  FileText,
  Map,
  DollarSign,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

import { FaGithub, FaTwitter } from "react-icons/fa";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const NAV_COLS = [
  {
    heading: "Product",
    links: [
      { label: "Features",     href: "#", icon: <Zap className="w-3 h-3" /> },
      { label: "How It Works", href: "#", icon: <Shield className="w-3 h-3" /> },
      { label: "Roadmap",      href: "#", icon: <Map className="w-3 h-3" /> },
      { label: "Pricing",      href: "#", icon: <DollarSign className="w-3 h-3" /> },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#", icon: <BookOpen className="w-3 h-3" /> },
      { label: "GitHub",        href: "#", icon: <FaGithub className="w-3 h-3" /> },
      { label: "Whitepaper",    href: "#", icon: <FileText className="w-3 h-3" /> },
      { label: "Support",       href: "#", icon: <HelpCircle className="w-3 h-3" /> },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Twitter / X", href: "#", icon: <FaTwitter className="w-3 h-3" /> },
      { label: "Discord",     href: "#", icon: <MessageCircle className="w-3 h-3" /> },
      { label: "Telegram",    href: "#", icon: <Send className="w-3 h-3" /> },
      { label: "Forum",       href: "#", icon: <Users className="w-3 h-3" /> },
    ],
  },
];

const STATS = [
  { value: "4,200+", label: "Contributors" },
  { value: "$2.4M",  label: "Stake Committed" },
  { value: "12,800", label: "Tasks Completed" },
  { value: "98.3%",  label: "Dispute-Free Rate" },
];

const SOCIAL = [
  { icon: <FaTwitter className="w-4 h-4" />,        href: "#", label: "Twitter" },
  { icon: <FaGithub className="w-4 h-4" />,          href: "#", label: "GitHub" },
  { icon: <MessageCircle className="w-4 h-4" />,   href: "#", label: "Discord" },
  { icon: <Send className="w-4 h-4" />,            href: "#", label: "Telegram" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

// ─────────────────────────────────────────────
// FADE-IN wrapper (inline, no external dep needed)
// ─────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
const Footer = () => {
  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">

      {/* ── subtle background grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── top glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6">

        {/* ── STATS BAR ── */}
        <FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-800/50 border-x border-b border-gray-800/50 rounded-b-2xl mb-16 overflow-hidden">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="bg-gray-950 px-6 py-5 text-center hover:bg-gray-900/60 transition-colors"
              >
                <p className="text-xl sm:text-2xl font-bold text-gray-100 tabular-nums">{s.value}</p>
                <p className="text-[11px] text-gray-600 font-medium mt-0.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand col — wider */}
          <FadeUp delay={0.05} >
            <div className="md:col-span-4">
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-950/50">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-lg font-bold tracking-tight">TeamChain</span>
                <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Mainnet
                </span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
                Transparent on-chain collaboration for modern teams. Track contributions, verify work, and build trust — fully decentralized.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2">
                {SOCIAL.map(s => (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 rounded-xl border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-500 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-200"
                  >
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Nav columns */}
          <div className="md:col-span-8 grid grid-cols-3 gap-8">
            {NAV_COLS.map((col, ci) => (
              <FadeUp key={col.heading} delay={0.1 + ci * 0.07}>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    {col.heading}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.links.map(link => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors duration-150"
                        >
                          <span className="text-gray-700 group-hover:text-indigo-400 transition-colors duration-150 flex-shrink-0">
                            {link.icon}
                          </span>
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 -ml-0.5 transition-opacity duration-150 flex-shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* ── NEWSLETTER BANNER ── */}
        <FadeUp delay={0.2}>
          <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/8 via-violet-600/6 to-transparent overflow-hidden mb-12 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* inner glow */}
            <div className="absolute right-0 top-0 w-48 h-full bg-indigo-600/5 blur-2xl pointer-events-none" />
            <div className="relative">
              <p className="text-sm font-semibold text-gray-200">Stay in the loop</p>
              <p className="text-xs text-gray-500 mt-0.5">Protocol updates, new features, and governance news — no spam.</p>
            </div>
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 sm:w-56 h-9 px-3 rounded-xl bg-gray-900 border border-gray-700 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex-shrink-0"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </FadeUp>

        {/* ── BOTTOM BAR ── */}
        <FadeUp delay={0.25}>
          <div className="border-t border-gray-800/70 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-700">
              © {new Date().getFullYear()} TeamChain. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              {LEGAL.map((l, i) => (
                <React.Fragment key={l.label}>
                  {i > 0 && <span className="w-px h-3 bg-gray-800" />}
                  <Link
                    href={l.href}
                    className="text-[11px] text-gray-700 hover:text-gray-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </FadeUp>

      </div>
    </footer>
  );
};

export default Footer;