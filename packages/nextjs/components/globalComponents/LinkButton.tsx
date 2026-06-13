import Link from "next/link";
import React from "react";

type ButtonVariant = "default" | "ghost";

const variants = {
  default:
    "bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400",
  ghost:
    "bg-transparent hover:bg-gray-900 text-white border border-gray-800",
};

const baseStyle =
  "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200";

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

export const LinkButton = ({
  href,
  children,
  className = "",
  variant = "default",
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
};