"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/utils/cn.util";

const NAV_ITEMS = [
  {
    label: "홈",
    href: "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={active ? "#06b6d410" : "none"}
        />
      </svg>
    ),
  },
  {
    label: "퀴즈",
    href: "/quiz",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={active ? "#06b6d410" : "none"}
        />
      </svg>
    ),
  },
  {
    label: "순위",
    href: "/leaderboard",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={active ? "#06b6d410" : "none"}
        />
      </svg>
    ),
  },
  {
    label: "커뮤니티",
    href: "/community",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={active ? "#06b6d410" : "none"}
        />
      </svg>
    ),
  },
  {
    label: "통계",
    href: "/stats",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="12"
          width="4"
          height="9"
          rx="1"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          fill={active ? "#06b6d410" : "none"}
        />
        <rect
          x="10"
          y="8"
          width="4"
          height="13"
          rx="1"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          fill={active ? "#06b6d410" : "none"}
        />
        <rect
          x="17"
          y="3"
          width="4"
          height="18"
          rx="1"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          fill={active ? "#06b6d410" : "none"}
        />
      </svg>
    ),
  },
  {
    label: "프로필",
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          fill={active ? "#06b6d410" : "none"}
        />
        <path
          d="M20 21c0-3.314-3.582-6-8-6s-8 2.686-8 6"
          stroke={active ? "#06b6d4" : "#6b7280"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2",
                isActive ? "text-cyan-400" : "text-gray-500"
              )}
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
