"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch, ExternalLink, MessageCircle } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";

const QUICK_LINKS = [
  { label: "How It Works", href: "/howItWorks" },
  { label: "Explore", href: "/explore" },
  { label: "Documentation", href: "/docs" },
  { label: "GitHub", href: "#" },
];

const SOCIALS = [
  {
    label: "Twitter",
    href: "#",
    icon: <FaTwitter className="w-4 h-4" />,
  },
  {
    label: "GitHub",
    href: "#",
    icon: <FaGithub className="w-4 h-4" />,
  },
  {
    label: "Discord",
    href: "#",
    icon: <MessageCircle className="w-4 h-4" />,
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-gray-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-12 lg:grid-cols-3"
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600">
                <GitBranch className="w-5 h-5 text-white" />
              </div>

              <div>
                <h3 className="font-bold text-white text-lg">
                  TeamChain
                </h3>

                <div className="inline-flex items-center gap-2 mt-1 px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Testnet
                </div>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Build trusted teams through GitHub reputation, transparent
              contributions, and stake-backed accountability.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Quick Links
            </h4>

            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}

                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Community
            </h4>

            <div className="flex items-center gap-3">
              {SOCIALS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Follow development updates and join the community.
            </p>
          </div>
        </motion.div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} TeamChain. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Currently Running on Testnet
          </div>
        </div>
      </div>
    </footer>
  );
}