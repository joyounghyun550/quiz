// import { typography as defaultTypography } from "@itandsy/react-common";

// 타이포그래피 공통 스타일 정의 (fontSize, lineHeight, letterSpacing만 포함)
// const typographyStyles = {
//   display1: {
//     fontSize: "74px",
//     lineHeight: "104px",
//     letterSpacing: "-2.96px",
//   },
//   display2: {
//     fontSize: "56px",
//     lineHeight: "72px",
//     letterSpacing: "-1.79px",
//   },
//   heading1: {
//     fontSize: "40px",
//     lineHeight: "52px",
//     letterSpacing: "-1.13px",
//   },
//   heading2: {
//     fontSize: "36px",
//     lineHeight: "48px",
//     letterSpacing: "-0.97px",
//   },
//   heading3: {
//     fontSize: "28px",
//     lineHeight: "33px",
//     letterSpacing: "-0.66px",
//   },
//   heading4: {
//     fontSize: "24px",
//     lineHeight: "32px",
//     letterSpacing: "-0.55px",
//   },
//   heading5: {
//     fontSize: "22px",
//     lineHeight: "30px",
//     letterSpacing: "-0.43px",
//   },
//   subtitle1: {
//     fontSize: "20px",
//     lineHeight: "30px",
//     letterSpacing: "-0.24px",
//   },
//   subtitle2: {
//     fontSize: "18px",
//     lineHeight: "26px",
//     letterSpacing: "-0.04px",
//   },
//   "body1-normal": {
//     fontSize: "17px",
//     lineHeight: "26px",
//     letterSpacing: "0px",
//   },
//   "body1-reading": {
//     fontSize: "17px",
//     lineHeight: "28px",
//     letterSpacing: "0px",
//   },
//   "body2-normal": {
//     fontSize: "16px",
//     lineHeight: "24px",
//     letterSpacing: "0.09px",
//   },
//   "body2-reading": {
//     fontSize: "16px",
//     lineHeight: "26px",
//     letterSpacing: "0.09px",
//   },
//   "label1-normal": {
//     fontSize: "15px",
//     lineHeight: "22px",
//     letterSpacing: "0.14px",
//   },
//   "label1-reading": {
//     fontSize: "15px",
//     lineHeight: "24px",
//     letterSpacing: "0.14px",
//   },
//   label2: {
//     fontSize: "14px",
//     lineHeight: "20px",
//     letterSpacing: "0.20px",
//   },
//   caption1: {
//     fontSize: "13px",
//     lineHeight: "18px",
//     letterSpacing: "0.25px",
//   },
//   caption2: {
//     fontSize: "12px",
//     lineHeight: "16px",
//     letterSpacing: "0.30px",
//   },
//   caption3: {
//     fontSize: "11px",
//     lineHeight: "14px",
//     letterSpacing: "0.34px",
//   },
// };

// 타이포그래피 토큰 생성 함수 (기본값과 깊은 병합)
// const createTypographyTokens = () => {
//   const customTokens: Record<string, Record<string, string | number>> = {};
//   // readonly 타입을 Record로 변환
//   const defaultTypo = defaultTypography as Record<string, Record<string, string | number>>;

//   Object.entries(typographyStyles).forEach(([key, style]) => {
//     // bold: 기본값의 fontWeight 유지
//     const boldKey = `text-${key}-bold`;
//     customTokens[boldKey] = {
//       ...(defaultTypo[boldKey] || {}), // 기본값 먼저 복사 (fontWeight, fontFamily, fontFeatureSettings 포함)
//       ...style, // 커스텀 값으로 덮어쓰기 (fontSize, lineHeight, letterSpacing만)
//     };

//     // medium: 기본값의 fontWeight 유지
//     const mediumKey = `text-${key}-medium`;
//     customTokens[mediumKey] = {
//       ...(defaultTypo[mediumKey] || {}), // 기본값 먼저 복사 (fontWeight, fontFamily, fontFeatureSettings 포함)
//       ...style, // 커스텀 값으로 덮어쓰기 (fontSize, lineHeight, letterSpacing만)
//     };

//     // regular: 기본값의 fontWeight 유지
//     const regularKey = `text-${key}-regular`;
//     customTokens[regularKey] = {
//       ...(defaultTypo[regularKey] || {}), // 기본값 먼저 복사 (fontWeight, fontFamily, fontFeatureSettings 포함)
//       ...style, // 커스텀 값으로 덮어쓰기 (fontSize, lineHeight, letterSpacing만)
//     };

//     // -sub 변형: Paperlogy 폰트 사용
//     const boldSubKey = `text-${key}-bold-sub`;
//     customTokens[boldSubKey] = {
//       ...style, // fontSize, lineHeight, letterSpacing
//       fontFamily: '"Paperlogy", sans-serif',
//       fontWeight: 700, // Paperlogy-7Bold 사용
//     };

//     const mediumSubKey = `text-${key}-medium-sub`;
//     customTokens[mediumSubKey] = {
//       ...style, // fontSize, lineHeight, letterSpacing
//       fontFamily: '"Paperlogy", sans-serif',
//       fontWeight: 500,
//     };

//     const regularSubKey = `text-${key}-regular-sub`;
//     customTokens[regularSubKey] = {
//       ...style, // fontSize, lineHeight, letterSpacing
//       fontFamily: '"Paperlogy", sans-serif',
//       fontWeight: 500, // Paperlogy-5Medium 사용
//     };
//   });

//   return customTokens;
// };

export const customThemeTokens = {
  colors: {
    "color-alias-primary-normal": "#00aeff",
    "color-alias-primary-strong": "#009ce7",
    "color-alias-primary-heavy": "#008dcf",
  },
  // backgrounds: {
  //   "color-background-banner-special": "linear-gradient(180deg, #00aeff 0%, #009ce7 82%)",
  // },
  // typography: createTypographyTokens(),
};
