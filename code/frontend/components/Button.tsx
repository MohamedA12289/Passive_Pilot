import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const styles: Record<string, string> = {
  primary: "bg-white text-black hover:bg-zinc-200",
  secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "bg-transparent text-white hover:bg-zinc-900 border border-zinc-800",
};

export function Button({ variant = "secondary", className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}
