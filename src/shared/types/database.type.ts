export type TierName = "inline" | "element" | "selector" | "script" | "component" | "hook" | "architect" | "deployer";

// Row type aliases for convenience
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuizSessionRow = Database["public"]["Tables"]["quiz_sessions"]["Row"];
export type AnswerHistoryRow = Database["public"]["Tables"]["answer_history"]["Row"];
export type CategoryStatRow = Database["public"]["Tables"]["category_stats"]["Row"];
export type LpHistoryRow = Database["public"]["Tables"]["lp_history"]["Row"];
export type DailyQuizLogRow = Database["public"]["Tables"]["daily_quiz_log"]["Row"];

export type QuestionFormat = "multiple_choice" | "code_output" | "true_false";

export type QuestionCategory = "javascript" | "typescript" | "react" | "nextjs" | "css" | "web_fundamentals";

export type SessionType = "daily" | "placement";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          profile_image_url: string | null;
          provider: string;
          provider_id: string;
          current_lp: number;
          current_tier: TierName;
          current_tier_division: number;
          highest_tier: TierName;
          highest_lp: number;
          demotion_shield_until: string | null;
          current_streak: number;
          longest_streak: number;
          last_quiz_completed_at: string | null;
          total_correct: number;
          total_answered: number;
          has_completed_placement: boolean;
          notification_enabled: boolean;
          notification_time: string;
          fcm_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          profile_image_url?: string | null;
          provider: string;
          provider_id: string;
          current_lp?: number;
          current_tier?: TierName;
          current_tier_division?: number;
          highest_tier?: TierName;
          highest_lp?: number;
          demotion_shield_until?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_quiz_completed_at?: string | null;
          total_correct?: number;
          total_answered?: number;
          has_completed_placement?: boolean;
          notification_enabled?: boolean;
          notification_time?: string;
          fcm_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          profile_image_url?: string | null;
          provider?: string;
          provider_id?: string;
          current_lp?: number;
          current_tier?: TierName;
          current_tier_division?: number;
          highest_tier?: TierName;
          highest_lp?: number;
          demotion_shield_until?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_quiz_completed_at?: string | null;
          total_correct?: number;
          total_answered?: number;
          has_completed_placement?: boolean;
          notification_enabled?: boolean;
          notification_time?: string;
          fcm_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          format: QuestionFormat;
          category: QuestionCategory;
          subcategory: string;
          difficulty: number;
          title: string;
          body: string;
          code_snippet: string | null;
          code_language: string;
          options: QuestionOption[] | null;
          correct_answer: string;
          hint_1: string | null;
          hint_2: string | null;
          explanation: string;
          explanation_code: string | null;
          reference_url: string | null;
          is_active: boolean;
          times_served: number;
          times_correct: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          format: QuestionFormat;
          category: QuestionCategory;
          subcategory: string;
          difficulty: number;
          title: string;
          body: string;
          code_snippet?: string | null;
          code_language?: string;
          options?: QuestionOption[] | null;
          correct_answer: string;
          hint_1?: string | null;
          hint_2?: string | null;
          explanation: string;
          explanation_code?: string | null;
          reference_url?: string | null;
          is_active?: boolean;
          times_served?: number;
          times_correct?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          format?: QuestionFormat;
          category?: QuestionCategory;
          subcategory?: string;
          difficulty?: number;
          title?: string;
          body?: string;
          code_snippet?: string | null;
          code_language?: string;
          options?: QuestionOption[] | null;
          correct_answer?: string;
          hint_1?: string | null;
          hint_2?: string | null;
          explanation?: string;
          explanation_code?: string | null;
          reference_url?: string | null;
          is_active?: boolean;
          times_served?: number;
          times_correct?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: SessionType;
          status: SessionStatus;
          started_at: string;
          completed_at: string | null;
          total_questions: number;
          correct_count: number;
          lp_change: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: SessionType;
          status?: SessionStatus;
          started_at?: string;
          completed_at?: string | null;
          total_questions: number;
          correct_count?: number;
          lp_change?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: SessionType;
          status?: SessionStatus;
          started_at?: string;
          completed_at?: string | null;
          total_questions?: number;
          correct_count?: number;
          lp_change?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      answer_history: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          session_id: string;
          user_answer: string;
          is_correct: boolean;
          hint_1_used: boolean;
          hint_2_used: boolean;
          lp_change: number;
          time_spent_ms: number | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          session_id: string;
          user_answer: string;
          is_correct: boolean;
          hint_1_used?: boolean;
          hint_2_used?: boolean;
          lp_change?: number;
          time_spent_ms?: number | null;
          answered_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          session_id?: string;
          user_answer?: string;
          is_correct?: boolean;
          hint_1_used?: boolean;
          hint_2_used?: boolean;
          lp_change?: number;
          time_spent_ms?: number | null;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answer_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answer_history_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answer_history_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      category_stats: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          subcategory: string;
          total_answered: number;
          total_correct: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          subcategory: string;
          total_answered?: number;
          total_correct?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          subcategory?: string;
          total_answered?: number;
          total_correct?: number;
        };
        Relationships: [
          {
            foreignKeyName: "category_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      lp_history: {
        Row: {
          id: string;
          user_id: string;
          lp_before: number;
          lp_after: number;
          lp_change: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lp_before: number;
          lp_after: number;
          lp_change: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lp_before?: number;
          lp_after?: number;
          lp_change?: number;
          reason?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lp_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_quiz_log: {
        Row: {
          id: string;
          user_id: string;
          quiz_date: string;
          session_id: string | null;
          is_completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_date?: string;
          session_id?: string | null;
          is_completed?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_date?: string;
          session_id?: string | null;
          is_completed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "daily_quiz_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_quiz_log_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
