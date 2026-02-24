export type TierName = "inline" | "element" | "selector" | "script" | "component" | "hook" | "architect" | "deployer";

// Row type aliases for convenience
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuizSessionRow = Database["public"]["Tables"]["quiz_sessions"]["Row"];
export type AnswerHistoryRow = Database["public"]["Tables"]["answer_history"]["Row"];
export type CategoryStatRow = Database["public"]["Tables"]["category_stats"]["Row"];
export type CategoryLpRow = Database["public"]["Tables"]["category_lp"]["Row"];
export type LpHistoryRow = Database["public"]["Tables"]["lp_history"]["Row"];
export type DailyQuizLogRow = Database["public"]["Tables"]["daily_quiz_log"]["Row"];
export type CommunityPostRow = Database["public"]["Tables"]["community_posts"]["Row"];

export type QuestionFormat = "multiple_choice" | "code_output" | "true_false";

export type QuestionCategory =
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "css"
  | "web_fundamentals"
  | "interview"
  | "certification";

export type SessionType = "daily" | "placement" | "practice" | "timeattack" | "weekly" | "interview" | "certification";

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
          push_subscription: Json | null;
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
          push_subscription?: Json | null;
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
          push_subscription?: Json | null;
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
      category_lp: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          lp: number;
          total_answered: number;
          total_correct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          lp?: number;
          total_answered?: number;
          total_correct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          lp?: number;
          total_answered?: number;
          total_correct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "category_lp_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          question_id: string | null;
          parent_id: string | null;
          type: "comment" | "question" | "discussion";
          title: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id?: string | null;
          parent_id?: string | null;
          type: "comment" | "question" | "discussion";
          title?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string | null;
          parent_id?: string | null;
          type?: "comment" | "question" | "discussion";
          title?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_posts_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_posts_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      timeattack_scores: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          score: number;
          total_time_ms: number;
          correct_count: number;
          combo_max: number;
          played_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          score: number;
          total_time_ms: number;
          correct_count?: number;
          combo_max?: number;
          played_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          score?: number;
          total_time_ms?: number;
          correct_count?: number;
          combo_max?: number;
          played_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timeattack_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "timeattack_scores_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      achievements: {
        Row: {
          id: string;
          key: string;
          category: string;
          title: string;
          description: string;
          icon: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          category: string;
          title: string;
          description: string;
          icon: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          category?: string;
          title?: string;
          description?: string;
          icon?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty_bonus: number;
          lp_multiplier: number;
          start_date: string;
          end_date: string;
          question_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty_bonus?: number;
          lp_multiplier?: number;
          start_date: string;
          end_date: string;
          question_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty_bonus?: number;
          lp_multiplier?: number;
          start_date?: string;
          end_date?: string;
          question_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      weekly_challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          session_id: string | null;
          score: number;
          correct_count: number;
          total_time_ms: number;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          session_id?: string | null;
          score?: number;
          correct_count?: number;
          total_time_ms?: number;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          session_id?: string | null;
          score?: number;
          correct_count?: number;
          total_time_ms?: number;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "weekly_challenge_participants_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "weekly_challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weekly_challenge_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weekly_challenge_participants_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      code_challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: number;
          initial_code: string;
          solution_code: string;
          test_cases: Json;
          hints: Json | null;
          time_limit_ms: number;
          is_active: boolean;
          times_served: number;
          times_solved: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          difficulty: number;
          initial_code: string;
          solution_code: string;
          test_cases: Json;
          hints?: Json | null;
          time_limit_ms?: number;
          is_active?: boolean;
          times_served?: number;
          times_solved?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: number;
          initial_code?: string;
          solution_code?: string;
          test_cases?: Json;
          hints?: Json | null;
          time_limit_ms?: number;
          is_active?: boolean;
          times_served?: number;
          times_solved?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      code_challenge_submissions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          code: string;
          passed_count: number;
          total_tests: number;
          is_solved: boolean;
          lp_change: number;
          time_spent_ms: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          code: string;
          passed_count?: number;
          total_tests?: number;
          is_solved?: boolean;
          lp_change?: number;
          time_spent_ms?: number | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          code?: string;
          passed_count?: number;
          total_tests?: number;
          is_solved?: boolean;
          lp_change?: number;
          time_spent_ms?: number | null;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "code_challenge_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "code_challenge_submissions_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "code_challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          season_number: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          season_number: number;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          season_number?: number;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      season_records: {
        Row: {
          id: string;
          season_id: string;
          user_id: string;
          final_lp: number;
          final_tier: string;
          final_rank: number | null;
          total_quizzes: number;
          total_correct: number;
          reward_claimed: boolean;
        };
        Insert: {
          id?: string;
          season_id: string;
          user_id: string;
          final_lp?: number;
          final_tier?: string;
          final_rank?: number | null;
          total_quizzes?: number;
          total_correct?: number;
          reward_claimed?: boolean;
        };
        Update: {
          id?: string;
          season_id?: string;
          user_id?: string;
          final_lp?: number;
          final_tier?: string;
          final_rank?: number | null;
          total_quizzes?: number;
          total_correct?: number;
          reward_claimed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "season_records_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "season_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_tips: {
        Row: {
          id: string;
          category: string;
          title: string;
          content: string;
          code_snippet: string | null;
          reference_url: string | null;
          tip_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          title: string;
          content: string;
          code_snippet?: string | null;
          reference_url?: string | null;
          tip_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          title?: string;
          content?: string;
          code_snippet?: string | null;
          reference_url?: string | null;
          tip_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      tip_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          tip_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tip_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tip_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tip_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tip_bookmarks_tip_id_fkey";
            columns: ["tip_id"];
            isOneToOne: false;
            referencedRelation: "daily_tips";
            referencedColumns: ["id"];
          },
        ];
      };
      battles: {
        Row: {
          id: string;
          invite_code: string;
          host_id: string;
          guest_id: string | null;
          session_id: string | null;
          status: string;
          question_count: number;
          category: string | null;
          host_score: number;
          host_correct: number;
          host_time_ms: number;
          guest_score: number;
          guest_correct: number;
          guest_time_ms: number;
          winner_id: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          invite_code: string;
          host_id: string;
          guest_id?: string | null;
          session_id?: string | null;
          status?: string;
          question_count?: number;
          category?: string | null;
          host_score?: number;
          host_correct?: number;
          host_time_ms?: number;
          guest_score?: number;
          guest_correct?: number;
          guest_time_ms?: number;
          winner_id?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          invite_code?: string;
          host_id?: string;
          guest_id?: string | null;
          session_id?: string | null;
          status?: string;
          question_count?: number;
          category?: string | null;
          host_score?: number;
          host_correct?: number;
          host_time_ms?: number;
          guest_score?: number;
          guest_correct?: number;
          guest_time_ms?: number;
          winner_id?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "battles_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "battles_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      battle_questions: {
        Row: {
          id: string;
          battle_id: string;
          question_id: string;
          question_order: number;
        };
        Insert: {
          id?: string;
          battle_id: string;
          question_id: string;
          question_order: number;
        };
        Update: {
          id?: string;
          battle_id?: string;
          question_id?: string;
          question_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "battle_questions_battle_id_fkey";
            columns: ["battle_id"];
            isOneToOne: false;
            referencedRelation: "battles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "battle_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      skill_nodes: {
        Row: {
          id: string;
          category: string;
          subcategory: string;
          name: string;
          description: string;
          icon: string;
          parent_id: string | null;
          required_correct: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          subcategory: string;
          name: string;
          description: string;
          icon: string;
          parent_id?: string | null;
          required_correct?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          subcategory?: string;
          name?: string;
          description?: string;
          icon?: string;
          parent_id?: string | null;
          required_correct?: number;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skill_nodes_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "skill_nodes";
            referencedColumns: ["id"];
          },
        ];
      };
      user_skill_progress: {
        Row: {
          id: string;
          user_id: string;
          node_id: string;
          correct_count: number;
          total_answered: number;
          is_unlocked: boolean;
          unlocked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          node_id: string;
          correct_count?: number;
          total_answered?: number;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          node_id?: string;
          correct_count?: number;
          total_answered?: number;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_skill_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_skill_progress_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "skill_nodes";
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

// ============ 타임어택 관련 타입 ============
export type TimeattackScoreRow = Database["public"]["Tables"]["timeattack_scores"]["Row"];

// ============ 업적 관련 타입 ============
export type AchievementRow = Database["public"]["Tables"]["achievements"]["Row"];

export type UserAchievementRow = Database["public"]["Tables"]["user_achievements"]["Row"];

// ============ 위클리 챌린지 관련 타입 ============
export type WeeklyChallengeRow = Database["public"]["Tables"]["weekly_challenges"]["Row"];

export type WeeklyChallengeParticipantRow = Database["public"]["Tables"]["weekly_challenge_participants"]["Row"];

// ============ 코드 챌린지 관련 타입 ============
export type CodeChallengeRow = Database["public"]["Tables"]["code_challenges"]["Row"];

export type CodeChallengeSubmissionRow = Database["public"]["Tables"]["code_challenge_submissions"]["Row"];

export type TestCase = {
  input: string;
  expectedOutput: string;
  description: string;
};

// ============ 시즌 관련 타입 ============
export type SeasonRow = Database["public"]["Tables"]["seasons"]["Row"];

export type SeasonRecordRow = Database["public"]["Tables"]["season_records"]["Row"];

// ============ 팁 관련 타입 ============
export type DailyTipRow = Database["public"]["Tables"]["daily_tips"]["Row"];

export type TipBookmarkRow = Database["public"]["Tables"]["tip_bookmarks"]["Row"];

// ============ 대결 관련 타입 ============
export type BattleRow = Database["public"]["Tables"]["battles"]["Row"];

export type BattleQuestionRow = Database["public"]["Tables"]["battle_questions"]["Row"];

// ============ 스킬 트리 관련 타입 ============
export type SkillNodeRow = Database["public"]["Tables"]["skill_nodes"]["Row"];

export type UserSkillProgressRow = Database["public"]["Tables"]["user_skill_progress"]["Row"];
