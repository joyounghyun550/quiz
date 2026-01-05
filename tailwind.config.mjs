import preset from "@itandsy/react-common/preset";

const config = {
  presets: [preset],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@itandsy/react-common/dist/**/*.{js,mjs}",
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
    },
  },
  plugins: [],
};

export default config;
