"use client";

import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export default function EmptyState({ title, description, primaryAction, secondaryAction }: Props) {
  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/60 p-8 shadow-sm">
      <div className="flex flex-col items-start gap-2">
        <h3 className="text-lg font-semibold text-neutral-100">{title}</h3>
        {description ? <p className="text-sm text-neutral-400">{description}</p> : null}

        {(primaryAction || secondaryAction) ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
              >
                {primaryAction.label}
              </Link>
            ) : null}

            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-900"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
