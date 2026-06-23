import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export const Button = ({ className = "", children, variant = "default", ...props }: ButtonProps) => {
  const variants = {
    default: "bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400",
    ghost: "bg-transparent hover:bg-gray-900 text-white border border-gray-800",
  };

  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
        variants[variant]
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
