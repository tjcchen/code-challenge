// TypeScript types for University Application Tracking System
// Generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'student' | 'parent' | 'teacher' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          graduation_year: number
          gpa: number | null
          sat_score: number | null
          act_score: number | null
          target_countries: string[]
          intended_majors: string[]
          high_school: string | null
          counselor_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          graduation_year: number
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          target_countries?: string[]
          intended_majors?: string[]
          high_school?: string | null
          counselor_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          graduation_year?: number
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          target_countries?: string[]
          intended_majors?: string[]
          high_school?: string | null
          counselor_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parent_student_relationships: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          relationship_type: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          relationship_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
          relationship_type?: string
          created_at?: string
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          short_name: string | null
          country: string
          state: string | null
          city: string | null
          website_url: string | null
          logo_url: string | null
          us_news_ranking: number | null
          acceptance_rate: number | null
          application_system: string | null
          application_fee: number | null
          tuition_in_state: number | null
          tuition_out_state: number | null
          room_board: number | null
          deadlines: Json
          student_population: number | null
          location_type: string | null
          school_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          country?: string
          state?: string | null
          city?: string | null
          website_url?: string | null
          logo_url?: string | null
          us_news_ranking?: number | null
          acceptance_rate?: number | null
          application_system?: string | null
          application_fee?: number | null
          tuition_in_state?: number | null
          tuition_out_state?: number | null
          room_board?: number | null
          deadlines?: Json
          student_population?: number | null
          location_type?: string | null
          school_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          country?: string
          state?: string | null
          city?: string | null
          website_url?: string | null
          logo_url?: string | null
          us_news_ranking?: number | null
          acceptance_rate?: number | null
          application_system?: string | null
          application_fee?: number | null
          tuition_in_state?: number | null
          tuition_out_state?: number | null
          room_board?: number | null
          deadlines?: Json
          student_population?: number | null
          location_type?: string | null
          school_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      university_majors: {
        Row: {
          id: string
          university_id: string
          major_name: string
          department: string | null
          degree_type: string | null
          is_popular: boolean
          created_at: string
        }
        Insert: {
          id?: string
          university_id: string
          major_name: string
          department?: string | null
          degree_type?: string | null
          is_popular?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          major_name?: string
          department?: string | null
          degree_type?: string | null
          is_popular?: boolean
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          student_id: string
          university_id: string
          application_type: 'early_decision' | 'early_action' | 'regular_decision' | 'rolling_admission'
          intended_major: string | null
          deadline: string
          status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred'
          submitted_date: string | null
          decision_date: string | null
          decision_type: string | null
          financial_aid_requested: boolean
          scholarship_applied: boolean
          notes: string | null
          priority_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          university_id: string
          application_type: 'early_decision' | 'early_action' | 'regular_decision' | 'rolling_admission'
          intended_major?: string | null
          deadline: string
          status?: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred'
          submitted_date?: string | null
          decision_date?: string | null
          decision_type?: string | null
          financial_aid_requested?: boolean
          scholarship_applied?: boolean
          notes?: string | null
          priority_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          university_id?: string
          application_type?: 'early_decision' | 'early_action' | 'regular_decision' | 'rolling_admission'
          intended_major?: string | null
          deadline?: string
          status?: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred'
          submitted_date?: string | null
          decision_date?: string | null
          decision_type?: string | null
          financial_aid_requested?: boolean
          scholarship_applied?: boolean
          notes?: string | null
          priority_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      application_requirements: {
        Row: {
          id: string
          application_id: string
          requirement_type: 'personal_essay' | 'supplemental_essay' | 'transcript' | 'recommendation_letter' | 'test_scores' | 'portfolio' | 'interview' | 'application_fee' | 'fafsa' | 'css_profile' | 'other'
          title: string
          description: string | null
          status: 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'waived'
          deadline: string | null
          completed_date: string | null
          file_urls: string[]
          word_count_min: number | null
          word_count_max: number | null
          is_required: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          requirement_type: 'personal_essay' | 'supplemental_essay' | 'transcript' | 'recommendation_letter' | 'test_scores' | 'portfolio' | 'interview' | 'application_fee' | 'fafsa' | 'css_profile' | 'other'
          title: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'waived'
          deadline?: string | null
          completed_date?: string | null
          file_urls?: string[]
          word_count_min?: number | null
          word_count_max?: number | null
          is_required?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          requirement_type?: 'personal_essay' | 'supplemental_essay' | 'transcript' | 'recommendation_letter' | 'test_scores' | 'portfolio' | 'interview' | 'application_fee' | 'fafsa' | 'css_profile' | 'other'
          title?: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'waived'
          deadline?: string | null
          completed_date?: string | null
          file_urls?: string[]
          word_count_min?: number | null
          word_count_max?: number | null
          is_required?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      application_notes: {
        Row: {
          id: string
          application_id: string
          author_id: string
          note_type: string
          title: string | null
          content: string
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          author_id: string
          note_type?: string
          title?: string | null
          content: string
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          author_id?: string
          note_type?: string
          title?: string | null
          content?: string
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      application_events: {
        Row: {
          id: string
          application_id: string
          event_type: string
          event_description: string | null
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          event_type: string
          event_description?: string | null
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          event_type?: string
          event_description?: string | null
          event_data?: Json
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'parent' | 'teacher' | 'admin'
      application_type: 'early_decision' | 'early_action' | 'regular_decision' | 'rolling_admission'
      application_status: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'deferred'
      requirement_type: 'personal_essay' | 'supplemental_essay' | 'transcript' | 'recommendation_letter' | 'test_scores' | 'portfolio' | 'interview' | 'application_fee' | 'fafsa' | 'css_profile' | 'other'
      requirement_status: 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'waived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type UserRole = Database['public']['Enums']['user_role']
export type ApplicationType = Database['public']['Enums']['application_type']
export type ApplicationStatus = Database['public']['Enums']['application_status']
export type RequirementType = Database['public']['Enums']['requirement_type']
export type RequirementStatus = Database['public']['Enums']['requirement_status']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type University = Database['public']['Tables']['universities']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationRequirement = Database['public']['Tables']['application_requirements']['Row']
export type ApplicationNote = Database['public']['Tables']['application_notes']['Row']
export type ApplicationEvent = Database['public']['Tables']['application_events']['Row']

// Extended types with relationships
export interface StudentWithProfile extends Student {
  profile: Profile
}

export interface ApplicationWithUniversity extends Omit<Application, 'notes'> {
  university: University
  requirements: ApplicationRequirement[]
  notes: ApplicationNote[]
  events: ApplicationEvent[]
  application_notes?: string | null // Keep original notes field
}

export interface UniversityWithMajors extends University {
  majors: Database['public']['Tables']['university_majors']['Row'][]
}

// Dashboard specific types
export interface DashboardStats {
  totalApplications: number
  submittedApplications: number
  acceptedApplications: number
  rejectedApplications: number
  waitlistedApplications: number
  upcomingDeadlines: Application[]
  recentEvents: ApplicationEvent[]
}

export interface UniversityDeadlines {
  early_decision?: string
  early_action?: string
  regular?: string
  rolling?: string | null
}
