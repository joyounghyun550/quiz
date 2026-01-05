"use client";

import { ThemeProvider } from "@itandsy/react-common";
import { ReactNode } from "react";
import { customThemeTokens } from "@/shared/config/theme";
import { QueryProvider } from "@/shared/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider customTokens={customThemeTokens}>{children}</ThemeProvider>
    </QueryProvider>
  );
}
