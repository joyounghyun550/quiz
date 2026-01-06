import type { Metadata } from "next";

import "@/app/globals.css";
import { Providers } from "@/providers/Providers";

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
