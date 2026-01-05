/**
 * 테마 커스터마이징 설정
 *
 * 프로젝트의 브랜드 색상과 스타일을 여기서 설정할 수 있습니다.
 * @itandsy/react-common 라이브러리의 기본 토큰을 오버라이드합니다.
 */

export const customThemeTokens = {
  colors: {
    // Primary 색상 (프로젝트 메인 색상)
    // tailwind.config.mjs의 색상과 동기화
    "color-alias-primary-normal": "#0066FF", // 기본 프라이머리 색상
    "color-alias-primary-strong": "#005EEB", // 강조 프라이머리 색상 (hover, active 등)
    "color-alias-primary-heavy": "#0054D1", // 진한 프라이머리 색상 (disabled 등)
  },

  // 필요시 다른 토큰도 커스터마이징 가능
  // components: {
  //   "color-alias-component-button-primary": "#0066FF",
  // },
  // backgrounds: {
  //   "color-alias-background-normal-normal": "#FFFFFF",
  // },
  // typography: {
  //   "text-heading1-bold": {
  //     fontSize: "48px",
  //     lineHeight: "1.2",
  //     fontWeight: 700,
  //   },
  // },
};

