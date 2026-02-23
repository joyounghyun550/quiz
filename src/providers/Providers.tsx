"use client";

import { ReactNode } from "react";

import { Toaster } from "sonner";

import { QueryProvider } from "@/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
};
