"use client";

import { toast } from "sonner";
import { apiMessage } from "@/lib/api/client";

export const notify = {
  success(message: string) {
    toast.success(message);
  },
  error(message: string, id?: string) {
    toast.error(message, id ? { id } : undefined);
  },
  warning(message: string, id?: string) {
    toast.warning(message, id ? { id } : undefined);
  },
  info(message: string, id?: string) {
    toast.info(message, id ? { id } : undefined);
  },
  apiError(error: unknown, fallback = "Something went wrong. Please try again.", id?: string) {
    toast.error(apiMessage(error, fallback), id ? { id } : undefined);
  },
};
