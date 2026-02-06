const nextConfig = {
  // 성능 최적화 설정
  reactStrictMode: false,
  compress: true,

  // Standalone 모드: 배포 시 필요한 최소 파일만 .next/standalone에 생성
  output: "standalone",

  // /dev 경로에서 서비스되도록 basePath 설정
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/dev",

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 이미지 캐싱 시간 (1년) - 첫 최적화 후 재사용
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
    ],
    remotePatterns: [],
  },

  webpack: (config) => {
    // SVG 파일을 React 컴포넌트로 변환
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            typescript: true,
            // 모든 props(className 포함)를 SVG 컴포넌트에 전달
            expandProps: "end",
          },
        },
      ],
    });

    return config;
  },

  // App Router 최적화 설정
  experimental: {
    scrollRestoration: false,
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // 패키지 임포트 최적화 유지
    optimizePackageImports: ["zustand"],
  },

  // 프록시 설정
  // basePath가 설정된 경우에도 API 프록시가 작동하도록 설정
  async rewrites() {
    return [
      {
        source: "/api-dev/v1/:path*",
        destination: "https://www.bokjiportal.kr/api-dev/v1/:path*",
        basePath: false, // basePath 무시 - API 요청은 /api-dev/v1로 직접 접근
      },
    ];
  },

  async redirects() {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/dev";

    // basePath가 있을 때만 리다이렉트 설정
    if (basePath) {
      return [
        {
          source: "/auth/callback",
          destination: `${basePath}/auth/callback`,
          basePath: false,
          permanent: false,
        },
      ];
    }

    // 상용 서버 (basePath 없음) - 리다이렉트 불필요
    return [];
  },
};

export default nextConfig;
