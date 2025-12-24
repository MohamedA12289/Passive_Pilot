import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = "", ...props }: Props) {
  return (
    <label className="block w-full">
      {label ? <div className="mb-1 text-xs text-zinc-400">{label}</div> : null}
      <input
        {...props}
        className={`w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-600 ${className}`}
      />
    </label>
  );
}
