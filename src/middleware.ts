import { type NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // 인증 체크, 리다이렉트 등의 로직
  return NextResponse.next();
}

// 특정 경로에만 미들웨어 적용 (필요시)
// export const config = {
//   matcher: ["/dashboard/:path*", "/admin/:path*"],
// };
