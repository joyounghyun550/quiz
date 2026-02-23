import type { Metadata } from "next";

import "@/app/globals.css";
import { Providers } from "@/providers/Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DevRank - Frontend Developer Quiz",
  description: "Level up your frontend skills with daily quizzes. Climb the ranks from Inline to Deployer!",
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
