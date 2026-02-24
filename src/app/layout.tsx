import type { Metadata } from "next";

import KakaoSdkLoader from "@/shared/ui/KakaoSdkLoader";

import "@/app/globals.css";
import { Providers } from "@/providers/Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DevRank - Frontend Developer Quiz",
  description: "매일 5문제 Frontend 퀴즈로 실력을 키우고 랭크를 올려보세요. Inline부터 Deployer까지!",
  openGraph: {
    title: "DevRank - Frontend Developer Quiz",
    description: "매일 5문제 Frontend 퀴즈로 실력을 키우고 랭크를 올려보세요.",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "DevRank",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "DevRank - Frontend Developer Quiz",
    description: "매일 5문제 Frontend 퀴즈로 실력을 키우고 랭크를 올려보세요.",
    images: ["/icons/icon-512.png"],
  },
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
        <KakaoSdkLoader />
      </body>
    </html>
  );
}
