export type BattleStatus = "waiting" | "host_playing" | "guest_playing" | "both_playing" | "completed" | "expired";

export type BattleInfo = {
  id: string;
  inviteCode: string;
  status: BattleStatus;
  hostId: string;
  hostName: string;
  hostProfileImage: string | null;
  guestId: string | null;
  guestName: string | null;
  guestProfileImage: string | null;
  questionCount: number;
  category: string | null;
  createdAt: string;
  expiresAt: string;
};

export type BattleResult = {
  battleId: string;
  hostId: string;
  hostName: string;
  hostProfileImage: string | null;
  hostScore: number;
  hostCorrect: number;
  hostTimeMs: number;
  guestName: string;
  guestProfileImage: string | null;
  guestScore: number;
  guestCorrect: number;
  guestTimeMs: number;
  winnerId: string | null;
  isHost: boolean;
};
