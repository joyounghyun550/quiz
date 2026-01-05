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
      <body className="bg-white text-black">
        <Providers>
          <header>Header</header>
          <main>{children}</main>
          <footer>Footer</footer>
        </Providers>
      </body>
    </html>
  );
}
