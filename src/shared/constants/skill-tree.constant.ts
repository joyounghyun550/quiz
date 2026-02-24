export const SKILL_CATEGORIES = [
  { key: "javascript", label: "JavaScript", icon: "JS", color: "#F7DF1E" },
  { key: "typescript", label: "TypeScript", icon: "TS", color: "#3178C6" },
  { key: "react", label: "React", icon: "⚛", color: "#61DAFB" },
  { key: "nextjs", label: "Next.js", icon: "N", color: "#ffffff" },
  { key: "css", label: "CSS", icon: "🎨", color: "#38BDF8" },
  { key: "web_fundamentals", label: "Web", icon: "🌐", color: "#34D399" },
] as const;

export const SKILL_NODE_STATUS = {
  LOCKED: "locked",
  IN_PROGRESS: "in_progress",
  UNLOCKED: "unlocked",
} as const;
