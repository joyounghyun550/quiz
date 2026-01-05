"use client";

import { ReactNode } from "react";

import { ThemeProvider } from "@itandsy/react-common";

import { customThemeTokens } from "@/shared/config/theme";
import { QueryProvider } from "@/shared/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryProvider>
      <ThemeProvider customTokens={customThemeTokens}>{children}</ThemeProvider>
    </QueryProvider>
  );
}
