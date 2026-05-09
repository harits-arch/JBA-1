export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "admin";
export type Gender = "female" | "male";
export type ClassStatus = "draft" | "active" | "completed" | "archived";
export type Recommendation = "yes" | "maybe" | "no";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          firebase_uid: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          password_hash: string | null;
          phone_verified_at: string | null;
          gender: Gender | null;
          date_of_birth: string | null;
          instagram_username: string | null;
          profile_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firebase_uid: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          password_hash?: string | null;
          phone_verified_at?: string | null;
          gender?: Gender | null;
          date_of_birth?: string | null;
          instagram_username?: string | null;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      auth_otps: {
        Row: {
          id: string;
          phone: string;
          otp_hash: string;
          expires_at: string;
          consumed_at: string | null;
          attempts: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          otp_hash: string;
          expires_at: string;
          consumed_at?: string | null;
          attempts?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auth_otps"]["Insert"]>;
      };
      classes: {
        Row: {
          id: string;
          client_name: string;
          class_name: string | null;
          class_code: string;
          class_date: string;
          status: ClassStatus;
          post_test_open: boolean;
          location: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          class_name?: string | null;
          class_code: string;
          class_date: string;
          status?: ClassStatus;
          post_test_open?: boolean;
          location?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
      };
      trainers: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          role: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          role: string;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trainers"]["Insert"]>;
      };
      class_registrations: {
        Row: {
          id: string;
          user_id: string;
          class_id: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          class_id: string;
          registered_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["class_registrations"]["Insert"]
        >;
      };
      pre_test_submissions: {
        Row: {
          id: string;
          user_id: string;
          class_id: string;
          gender: Gender;
          grooming_frequency: string | null;
          expectations: string | null;
          obstacles: string[] | null;
          obstacle_explanation: string | null;
          female_activities: string[] | null;
          male_habits: string[] | null;
          male_skin_type: string | null;
          male_social_media_willing: boolean | null;
          male_upload_timeline: string | null;
          commitments: Json;
          answers: Json;
          before_photo_path: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          class_id: string;
          gender: Gender;
          grooming_frequency?: string | null;
          expectations?: string | null;
          obstacles?: string[] | null;
          obstacle_explanation?: string | null;
          female_activities?: string[] | null;
          male_habits?: string[] | null;
          male_skin_type?: string | null;
          male_social_media_willing?: boolean | null;
          male_upload_timeline?: string | null;
          commitments?: Json;
          answers?: Json;
          before_photo_path: string;
          submitted_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["pre_test_submissions"]["Insert"]
        >;
      };
      post_test_submissions: {
        Row: {
          id: string;
          user_id: string;
          class_id: string;
          after_photo_path: string;
          liked_most: string | null;
          improvement_feedback: string | null;
          next_steps: string | null;
          recommendation: Recommendation | null;
          recommendation_target: string | null;
          testimonial: string | null;
          content_consent: boolean;
          answers: Json;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          class_id: string;
          after_photo_path: string;
          liked_most?: string | null;
          improvement_feedback?: string | null;
          next_steps?: string | null;
          recommendation?: Recommendation | null;
          recommendation_target?: string | null;
          testimonial?: string | null;
          content_consent?: boolean;
          answers?: Json;
          submitted_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["post_test_submissions"]["Insert"]
        >;
      };
      trainer_ratings: {
        Row: {
          id: string;
          post_test_submission_id: string;
          trainer_id: string;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_test_submission_id: string;
          trainer_id: string;
          rating: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["trainer_ratings"]["Insert"]
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
