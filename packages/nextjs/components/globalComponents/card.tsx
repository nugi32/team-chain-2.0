import React from "react";

export const Card = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-gray-900 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

export const CardContent = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <div className={className}>{children}</div>;
};