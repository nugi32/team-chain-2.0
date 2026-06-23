"use client";

import React from "react";
import { motion } from "framer-motion";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] text-indigo-300 font-medium mb-4">
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">{children}</h2>;
}

export function SectionSub({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 leading-relaxed max-w-xl mb-8">{children}</p>;
}

export default function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={["mb-20", className].join(" ")}
    >
      {children}
    </motion.section>
  );
}
