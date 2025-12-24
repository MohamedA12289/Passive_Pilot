"use client";

import { useCallback, useState } from "react";
import type { ToastState } from "@/components/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ open: false, message: "" });

  const show = useCallback((message: string, tone: ToastState["tone"] = "neutral") => {
    setToast({ open: true, message, tone });
  }, []);

  const close = useCallback(() => {
    setToast((t) => ({ ...t, open: false }));
  }, []);

  return { toast, show, close };
}
