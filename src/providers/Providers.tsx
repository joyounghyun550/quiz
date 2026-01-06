"use client";

import { ReactNode } from "react";

import { ThemeProvider } from "@itandsy/react-common";
import { Toaster } from "sonner";

import { customThemeTokens } from "@/shared/config/theme";

import { QueryProvider } from "@/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryProvider>
      <ThemeProvider customTokens={customThemeTokens}>
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  );
};
