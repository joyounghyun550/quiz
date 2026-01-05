import type { Metadata } from "next";

import { Providers } from "@/shared/ui/Providers";

import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Buildin Web Front",
  description: "Buildin Web Front",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
