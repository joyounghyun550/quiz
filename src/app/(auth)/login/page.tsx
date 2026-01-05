// 레이아웃이 없는 로그인 페이지 예시
// (auth) 그룹에는 레이아웃이 없으므로 Header, Footer가 표시되지 않습니다

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1>Login Page</h1>
        <p>이 페이지는 레이아웃이 없습니다.</p>
      </div>
    </div>
  );
}
