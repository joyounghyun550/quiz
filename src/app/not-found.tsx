import Link from "next/link";

const NotFound = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 px-6 text-center">
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
      <span className="text-3xl font-bold text-gray-500">404</span>
    </div>
    <h1 className="mb-2 text-2xl font-bold text-white">페이지를 찾을 수 없어요</h1>
    <p className="mb-8 text-sm text-gray-400">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
    <Link
      href="/"
      className="flex h-12 items-center justify-center rounded-xl bg-cyan-500 px-8 font-semibold text-white transition-colors hover:bg-cyan-600"
    >
      홈으로 돌아가기
    </Link>
  </div>
);

export default NotFound;
