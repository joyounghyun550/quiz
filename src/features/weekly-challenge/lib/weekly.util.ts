/**
 * 현재 주의 월요일~일요일 범위 계산 (KST 기준)
 */
export const getCurrentWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  // KST = UTC+9
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);

  const day = kstNow.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(kstNow);
  monday.setUTCDate(monday.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const startStr = monday.toISOString().split("T")[0];
  const endStr = sunday.toISOString().split("T")[0];

  return { start: startStr, end: endStr };
};

/**
 * 챌린지 종료까지 남은 시간 (ms)
 */
export const getTimeRemaining = (endDate: string): number => {
  const end = new Date(`${endDate}T23:59:59+09:00`);
  return Math.max(0, end.getTime() - Date.now());
};

/**
 * 남은 시간을 "X일 X시간" 문자열로 변환
 */
export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return "종료됨";

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) return `${days}일 ${remainingHours}시간 남음`;
  if (remainingHours > 0) return `${remainingHours}시간 남음`;
  return "곧 종료";
};
