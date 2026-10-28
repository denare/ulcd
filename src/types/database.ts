// Database types — mirrors the Supabase PostgreSQL schema
// Generated from migration definitions; update when schema changes

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PublicationStatus = 'draft' | 'published' | 'unpublished' | 'archived'
export type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'outdated' | 'rejected'
export type AcademicTitle = 'Prof.' | 'Assoc. Prof.' | 'Dr.' | 'Mr.' | 'Mrs.' | 'Ms.' | 'Eng.' | 'Rev.' | 'Other'
export type ContactType = 'mobile_phone' | 'office_phone' | 'email' | 'other'
export type ConsentStatus = 'unknown' | 'consented' | 'not_consented' | 'withdrawn'
export type ContactSourceType = 'self_submitted' | 'admin_added' | 'official_directory' | 'imported_csv' | 'other'
export type AssignmentType = 'lecturer' | 'co_lecturer' | 'tutorial' | 'coordinator'
export type AdminRole = 'platform_admin' | 'institution_admin' | 'editor'
export type ReportType =
  | 'incorrect_phone'
  | 'incorrect_email'
  | 'incorrect_office_phone'
  | 'outdated_information'
  | 'missing_lecturer'
  | 'duplicate_profile'
  | 'privacy_concern'
  | 'other'
export type ReportStatus =
  | 'pending_review'
  | 'under_review'
  | 'resolved_corrected'
  | 'resolved_verified'
  | 'resolved_hidden'
  | 'rejected'
  | 'spam'
export type AuditAction =
  | 'lecturer_created'
  | 'lecturer_updated'
  | 'lecturer_published'
  | 'lecturer_unpublished'
  | 'lecturer_archived'
  | 'contact_created'
  | 'contact_updated'
  | 'contact_published'
  | 'contact_hidden'
  | 'contact_verified'
  | 'contact_marked_outdated'
  | 'course_created'
  | 'course_updated'
  | 'assignment_created'
  | 'assignment_removed'
  | 'department_created'
  | 'department_updated'
  | 'report_reviewed'
  | 'admin_created'
  | 'admin_deactivated'
  | 'bulk_import_started'
  | 'bulk_import_completed'

type InsertWithOptionalColumns<Row, OptionalColumns extends keyof Row> =
  Omit<Row, OptionalColumns> & Partial<Pick<Row, OptionalColumns>>

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string
          name: string
          slug: string
          country_code: string
          website_url: string | null
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['institutions']['Row'],
          'id' | 'country_code' | 'website_url' | 'logo_url' | 'is_active' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['institutions']['Insert']>
        Relationships: []
      }
      schools: {
        Row: {
          id: string
          institution_id: string
          name: string
          slug: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['schools']['Row'],
          'id' | 'is_active' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['schools']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'schools_institution_id_fkey'
            columns: ['institution_id']
            isOneToOne: false
            referencedRelation: 'institutions'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          id: string
          institution_id: string
          school_id: string | null
          name: string
          slug: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['departments']['Row'],
          'id' | 'school_id' | 'description' | 'is_active' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['departments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'departments_institution_id_fkey'
            columns: ['institution_id']
            isOneToOne: false
            referencedRelation: 'institutions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'departments_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
        ]
      }
      lecturers: {
        Row: {
          id: string
          institution_id: string
          department_id: string | null
          title: AcademicTitle | null
          first_name: string
          middle_name: string | null
          last_name: string
          display_name: string
          office_location: string | null
          office_hours: string | null
          biography: string | null
          profile_image_url: string | null
          publication_status: PublicationStatus
          verification_status: VerificationStatus
          last_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['lecturers']['Row'],
          | 'id' | 'department_id' | 'title' | 'middle_name' | 'office_location'
          | 'office_hours' | 'biography' | 'profile_image_url' | 'publication_status'
          | 'verification_status' | 'last_verified_at' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['lecturers']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'lecturers_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lecturers_institution_id_fkey'
            columns: ['institution_id']
            isOneToOne: false
            referencedRelation: 'institutions'
            referencedColumns: ['id']
          },
        ]
      }
      lecturer_contacts: {
        Row: {
          id: string
          lecturer_id: string
          contact_type: ContactType
          contact_value: string
          display_value: string | null
          is_public: boolean
          verification_status: VerificationStatus
          verified_at: string | null
          verified_by: string | null
          source_type: ContactSourceType | null
          consent_status: ConsentStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['lecturer_contacts']['Row'],
          | 'id' | 'display_value' | 'is_public' | 'verification_status' | 'verified_at'
          | 'verified_by' | 'source_type' | 'consent_status' | 'notes' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['lecturer_contacts']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'lecturer_contacts_lecturer_id_fkey'
            columns: ['lecturer_id']
            isOneToOne: false
            referencedRelation: 'lecturers'
            referencedColumns: ['id']
          },
        ]
      }
      courses: {
        Row: {
          id: string
          institution_id: string
          department_id: string | null
          course_code: string
          course_name: string
          description: string | null
          academic_year: string | null
          semester: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['courses']['Row'],
          | 'id' | 'department_id' | 'description' | 'academic_year' | 'semester'
          | 'is_active' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'courses_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'courses_institution_id_fkey'
            columns: ['institution_id']
            isOneToOne: false
            referencedRelation: 'institutions'
            referencedColumns: ['id']
          },
        ]
      }
      lecturer_course_assignments: {
        Row: {
          id: string
          lecturer_id: string
          course_id: string
          academic_year: string | null
          semester: number | null
          assignment_type: AssignmentType
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['lecturer_course_assignments']['Row'],
          | 'id' | 'academic_year' | 'semester' | 'assignment_type' | 'is_active'
          | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['lecturer_course_assignments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'lecturer_course_assignments_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lecturer_course_assignments_lecturer_id_fkey'
            columns: ['lecturer_id']
            isOneToOne: false
            referencedRelation: 'lecturers'
            referencedColumns: ['id']
          },
        ]
      }
      admin_profiles: {
        Row: {
          id: string
          user_id: string
          institution_id: string | null
          role: AdminRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['admin_profiles']['Row'],
          | 'id' | 'institution_id' | 'role' | 'is_active' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['admin_profiles']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'admin_profiles_institution_id_fkey'
            columns: ['institution_id']
            isOneToOne: false
            referencedRelation: 'institutions'
            referencedColumns: ['id']
          },
        ]
      }
      correction_reports: {
        Row: {
          id: string
          lecturer_id: string | null
          contact_id: string | null
          report_type: ReportType
          description: string
          reporter_email: string | null
          status: ReportStatus
          reviewed_by: string | null
          reviewed_at: string | null
          admin_notes: string | null
          submitter_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['correction_reports']['Row'],
          | 'id' | 'lecturer_id' | 'contact_id' | 'reporter_email' | 'status'
          | 'reviewed_by' | 'reviewed_at' | 'admin_notes' | 'submitter_hash'
          | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['correction_reports']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'correction_reports_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'lecturer_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'correction_reports_lecturer_id_fkey'
            columns: ['lecturer_id']
            isOneToOne: false
            referencedRelation: 'lecturers'
            referencedColumns: ['id']
          },
        ]
      }
      audit_log: {
        Row: {
          id: string
          actor_id: string | null
          action: AuditAction
          entity_type: string
          entity_id: string | null
          metadata: Json
          ip_hash: string | null
          created_at: string
        }
        Insert: InsertWithOptionalColumns<
          Database['public']['Tables']['audit_log']['Row'],
          'id' | 'actor_id' | 'entity_id' | 'metadata' | 'ip_hash' | 'created_at'
        >
        Update: never // Append-only
        Relationships: []
      }
    }
    Functions: {
      search_lecturers: {
        Args: {
          search_query?: string
          dept_filter?: string
          school_filter?: string
          inst_filter?: string
          page_size?: number
          page_offset?: number
        }
        Returns: SearchLecturerRow[]
      }
      get_public_lecturer: {
        Args: { lecturer_uuid: string }
        Returns: PublicLecturerRow[]
      }
      submit_correction_report: {
        Args: {
          p_lecturer_id: string
          p_contact_id?: string
          p_report_type?: string
          p_description?: string
          p_reporter_email?: string
          p_submitter_hash?: string
        }
        Returns: string
      }
      get_admin_stats: {
        Args: Record<string, never>
        Returns: Json
      }
    }
    Views: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// RPC return types
export interface SearchLecturerRow {
  id: string
  display_name: string
  title: string | null
  department_id: string | null
  department_name: string | null
  school_id: string | null
  school_name: string | null
  institution_id: string
  institution_name: string
  verification_status: VerificationStatus
  last_verified_at: string | null
  has_phone: boolean
  has_email: boolean
  has_office_phone: boolean
  course_codes: string[]
}

export interface PublicContact {
  id: string
  contact_type: ContactType
  display_value: string
  verified_at: string | null
}

export interface PublicCourseAssignment {
  id: string
  course_code: string
  course_name: string
  academic_year: string | null
  semester: number | null
  assignment_type: AssignmentType
}

export interface PublicLecturerRow {
  id: string
  display_name: string
  title: string | null
  first_name: string
  last_name: string
  department_id: string | null
  department_name: string | null
  school_id: string | null
  school_name: string | null
  institution_id: string
  institution_name: string
  office_location: string | null
  office_hours: string | null
  biography: string | null
  verification_status: VerificationStatus
  last_verified_at: string | null
  contacts: PublicContact[]
  courses: PublicCourseAssignment[]
}

export interface AdminStats {
  total_lecturers: number
  published_lecturers: number
  verified_contacts: number
  public_contacts: number
  total_departments: number
  total_courses: number
  pending_reports: number
  recent_updates: Array<{ id: string; display_name: string; updated_at: string }> | null
}

// Convenience entity row types
export type Institution = Database['public']['Tables']['institutions']['Row']
export type School = Database['public']['Tables']['schools']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type Lecturer = Database['public']['Tables']['lecturers']['Row']
export type LecturerContact = Database['public']['Tables']['lecturer_contacts']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type LecturerCourseAssignment = Database['public']['Tables']['lecturer_course_assignments']['Row']
export type Assignment = LecturerCourseAssignment
export type AdminProfile = Database['public']['Tables']['admin_profiles']['Row']
export type CorrectionReport = Database['public']['Tables']['correction_reports']['Row']
export type AuditLog = Database['public']['Tables']['audit_log']['Row']
