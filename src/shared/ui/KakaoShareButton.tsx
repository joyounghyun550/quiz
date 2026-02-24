"use client";

import { cn } from "@/shared/utils/cn.util";

const KAKAO_TEMPLATE_ID = 129774;

type KakaoShareButtonProps = {
  templateArgs?: Record<string, string>;
  className?: string;
};

const KakaoShareButton = ({ templateArgs, className }: KakaoShareButtonProps) => {
  const handleShare = () => {
    if (typeof window === "undefined" || !window.Kakao?.isInitialized?.()) return;

    window.Kakao.Share.sendCustom({
      templateId: KAKAO_TEMPLATE_ID,
      ...(templateArgs ? { templateArgs } : {}),
    });
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] font-semibold text-[#191919] transition-opacity hover:opacity-90 active:opacity-80",
        className
      )}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5C4.858 1.5 1.5 4.08 1.5 7.268c0 2.034 1.35 3.826 3.394 4.84l-.864 3.22a.281.281 0 0 0 .434.303l3.93-2.604c.196.024.397.038.606.038 4.142 0 7.5-2.58 7.5-5.768S13.142 1.5 9 1.5z"
          fill="#191919"
        />
      </svg>
      카카오톡 공유하기
    </button>
  );
};

export default KakaoShareButton;
