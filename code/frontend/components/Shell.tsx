"use client";

import * as React from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

type ShellProps = {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
};

export function Shell({ children, showFooter = true, className }: ShellProps) {
  return (
    <div className={"min-h-screen flex flex-col " + (className ?? "")}>
      <Navigation />
      <main className="flex-1">{children}</main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}

export default Shell;
