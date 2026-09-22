"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4500}
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "!bg-card !text-white !border !border-border !shadow-lg",
          title: "!text-white",
          description: "!text-white/70",
          closeButton: "!bg-card !text-white !border-border",
        },
      }}
    />
  );
}
