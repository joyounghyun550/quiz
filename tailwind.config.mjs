import preset from "@itandsy/react-common/preset";

// 타이포그래피 필요할 경우 주석 해제

// 타이포그래피 공통 스타일 정의 (theme.ts와 동일한 값 사용)
// const typographyStyles = {
//   display1: ["74px", { lineHeight: "104px", letterSpacing: "-2.96px" }],
//   display2: ["56px", { lineHeight: "72px", letterSpacing: "-1.79px" }],
//   heading1: ["40px", { lineHeight: "52px", letterSpacing: "-1.13px" }],
//   heading2: ["36px", { lineHeight: "48px", letterSpacing: "-0.97px" }],
//   heading3: ["28px", { lineHeight: "33px", letterSpacing: "-0.66px" }],
//   heading4: ["24px", { lineHeight: "32px", letterSpacing: "-0.55px" }],
//   heading5: ["22px", { lineHeight: "30px", letterSpacing: "-0.43px" }],
//   subtitle1: ["20px", { lineHeight: "30px", letterSpacing: "-0.24px" }],
//   subtitle2: ["18px", { lineHeight: "26px", letterSpacing: "-0.04px" }],
//   "body1-normal": ["17px", { lineHeight: "26px", letterSpacing: "0px" }],
//   "body1-reading": ["17px", { lineHeight: "28px", letterSpacing: "0px" }],
//   "body2-normal": ["16px", { lineHeight: "24px", letterSpacing: "0.09px" }],
//   "body2-reading": ["16px", { lineHeight: "26px", letterSpacing: "0.09px" }],
//   "label1-normal": ["15px", { lineHeight: "22px", letterSpacing: "0.14px" }],
//   "label1-reading": ["15px", { lineHeight: "24px", letterSpacing: "0.14px" }],
//   label2: ["14px", { lineHeight: "20px", letterSpacing: "0.20px" }],
//   caption1: ["13px", { lineHeight: "18px", letterSpacing: "0.25px" }],
//   caption2: ["12px", { lineHeight: "16px", letterSpacing: "0.30px" }],
//   caption3: ["11px", { lineHeight: "14px", letterSpacing: "0.34px" }],
// };

// Tailwind fontSize 토큰 생성 함수
// const createFontSizeTokens = () => {
//   const tokens = {};

//   Object.entries(typographyStyles).forEach(([key, style]) => {
//     tokens[`${key}-bold`] = style;
//     tokens[`${key}-medium`] = style;
//     tokens[`${key}-regular`] = style;
//     // -sub 접미사가 있는 경우에도 동일한 스타일 적용
//     tokens[`${key}-bold-sub`] = style;
//     tokens[`${key}-medium-sub`] = style;
//     tokens[`${key}-regular-sub`] = style;
//   });

//   return tokens;
// };

// -sub 접미사가 있는 텍스트 클래스에 HancomMalangMalang 폰트 적용하는 플러그인
// const subFontPlugin = ({ addUtilities }) => {
//   const utilities = {};

//   // 모든 타이포그래피 스타일에 대해 -sub 버전 생성
//   Object.keys(typographyStyles).forEach((key) => {
//     ["bold", "medium", "regular"].forEach((weight) => {
//       utilities[`.text-${key}-${weight}-sub`] = {
//         fontFamily: '"Suite", sans-serif',
//       };
//     });
//   });

//   addUtilities(utilities);
// };

const config = {
  presets: [preset],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layout/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@itandsy/react-common/dist/**/*.{js,mjs}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tailwind 클래스명에서도 사용 가능하도록 설정
        "color-alias-primary": {
          normal: "#0066FF",
          strong: "#005EEB",
          heavy: "#0054D1",
        },
      },
      // fontSize: createFontSizeTokens(),
      fontFamily: {
        // 서브 폰트
        suite: ['"Suite"', "sans-serif"],
        pretendard: ['"Pretendard"', "sans-serif"],
      },
    },
  },
  // plugins: [subFontPlugin],
};

export default config;
