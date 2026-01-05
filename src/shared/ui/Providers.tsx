"use client";

import { ThemeProvider } from "@itandsy/react-common";
import { ReactNode } from "react";
import { customThemeTokens } from "@/shared/config/theme";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider customTokens={customThemeTokens}>{children}</ThemeProvider>
  );
}
