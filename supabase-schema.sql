-- University Application Tracking System - Supabase Schema
-- Created for Next.js + TypeScript + Supabase implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- AUTHENTICATION & USER MANAGEMENT TABLES
-- =============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles for role-based access control
CREATE TYPE user_role AS ENUM ('student', 'parent', 'teacher', 'admin');

CREATE TABLE user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Students table with academic profile
CREATE TABLE students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    graduation_year INTEGER NOT NULL,
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    sat_score INTEGER CHECK (sat_score >= 400 AND sat_score <= 1600),
    act_score INTEGER CHECK (act_score >= 1 AND act_score <= 36),
    target_countries TEXT[] DEFAULT '{}',
    intended_majors TEXT[] DEFAULT '{}',
    high_school VARCHAR(255),
    counselor_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parent-student relationships
CREATE TABLE parent_student_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'parent', -- parent, guardian, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- =============================================
-- UNIVERSITY & APPLICATION CORE TABLES
-- =============================================

-- Universities table with comprehensive information
CREATE TABLE universities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100), -- e.g., "MIT", "Stanford"
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    state VARCHAR(100),
    city VARCHAR(100),
    website_url TEXT,
    logo_url TEXT,
    
    -- Rankings and statistics
    us_news_ranking INTEGER,
    acceptance_rate DECIMAL(5,2) CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100),
    
    -- Application system information
    application_system VARCHAR(100), -- 'Common App', 'Coalition', 'Direct'
    application_fee DECIMAL(8,2) DEFAULT 0,
    
    -- Financial information
    tuition_in_state DECIMAL(10,2),
    tuition_out_state DECIMAL(10,2),
    room_board DECIMAL(10,2),
    
    -- Deadlines (stored as JSONB for flexibility)
    deadlines JSONB DEFAULT '{}', -- {early_decision: 'YYYY-MM-DD', early_action: 'YYYY-MM-DD', regular: 'YYYY-MM-DD', rolling: null}
    
    -- Additional metadata
    student_population INTEGER,
    location_type VARCHAR(50), -- urban, suburban, rural
    school_type VARCHAR(50), -- public, private
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- University majors/programs
CREATE TABLE university_majors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    major_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    degree_type VARCHAR(50), -- Bachelor, Master, PhD
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application types enum
CREATE TYPE application_type AS ENUM ('early_decision', 'early_action', 'regular_decision', 'rolling_admission');

-- Application status enum
CREATE TYPE application_status AS ENUM ('not_started', 'in_progress', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'deferred');

-- Main applications table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    
    -- Application details
    application_type application_type NOT NULL,
    intended_major VARCHAR(255),
    deadline DATE NOT NULL,
    status application_status DEFAULT 'not_started',
    
    -- Important dates
    submitted_date TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_type VARCHAR(50), -- accepted, rejected, waitlisted, deferred
    
    -- Financial aid
    financial_aid_requested BOOLEAN DEFAULT FALSE,
    scholarship_applied BOOLEAN DEFAULT FALSE,
    
    -- Notes and tracking
    notes TEXT,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5), -- 1 = highest priority
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, university_id, application_type)
);

-- =============================================
-- APPLICATION REQUIREMENTS & TRACKING
-- =============================================

-- Requirement types enum
CREATE TYPE requirement_type AS ENUM (
    'personal_essay', 'supplemental_essay', 'transcript', 'recommendation_letter',
    'test_scores', 'portfolio', 'interview', 'application_fee', 'fafsa', 'css_profile', 'other'
);

-- Requirement status enum
CREATE TYPE requirement_status AS ENUM ('not_started', 'in_progress', 'completed', 'submitted', 'waived');

-- Application requirements tracking
CREATE TABLE application_requirements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    requirement_type requirement_type NOT NULL,
    title VARCHAR(255) NOT NULL, -- e.g., "Common App Essay", "Why Stanford Essay"
    description TEXT,
    
    -- Status and deadlines
    status requirement_status DEFAULT 'not_started',
    deadline DATE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    -- File attachments (store file URLs from Supabase Storage)
    file_urls TEXT[] DEFAULT '{}',
    
    -- Additional metadata
    word_count_min INTEGER,
    word_count_max INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMUNICATION & NOTES
-- =============================================

-- Notes and communications (for parents to add notes, etc.)
CREATE TABLE application_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general', -- general, reminder, financial, etc.
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE, -- only visible to author
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DASHBOARD & ANALYTICS SUPPORT
-- =============================================

-- Application timeline events (for progress tracking)
CREATE TABLE application_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- status_change, deadline_reminder, document_uploaded, etc.
    event_description TEXT,
    event_data JSONB DEFAULT '{}', -- flexible data storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB DEFAULT '{}', -- notification settings, dashboard layout, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);

-- Students indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_graduation_year ON students(graduation_year);

-- Universities indexes
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_country_state ON universities(country, state);
CREATE INDEX idx_universities_ranking ON universities(us_news_ranking);
CREATE INDEX idx_universities_acceptance_rate ON universities(acceptance_rate);

-- Applications indexes
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_university_id ON applications(university_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_deadline ON applications(deadline);
CREATE INDEX idx_applications_student_status ON applications(student_id, status);

-- Application requirements indexes
CREATE INDEX idx_requirements_application_id ON application_requirements(application_id);
CREATE INDEX idx_requirements_status ON application_requirements(status);
CREATE INDEX idx_requirements_deadline ON application_requirements(deadline);

-- Parent-student relationship indexes
CREATE INDEX idx_parent_student_parent_id ON parent_student_relationships(parent_id);
CREATE INDEX idx_parent_student_student_id ON parent_student_relationships(student_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own role" ON user_roles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students policies
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own data" ON students FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own data" ON students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Parents can view their children's data" ON students FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM parent_student_relationships psr 
        WHERE psr.student_id = students.id AND psr.parent_id = auth.uid()
    )
);

-- Universities policies (public read access)
CREATE POLICY "Anyone can view universities" ON universities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view university majors" ON university_majors FOR SELECT TO authenticated USING (true);

-- Applications policies
CREATE POLICY "Students can manage own applications" ON applications FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = applications.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "Parents can view children's applications" ON applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM parent_student_relationships psr 
        JOIN students s ON s.id = psr.student_id 
        WHERE s.id = applications.student_id AND psr.parent_id = auth.uid()
    )
);

-- Application requirements policies
CREATE POLICY "Students can manage own application requirements" ON application_requirements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM applications a 
        JOIN students s ON s.id = a.student_id 
        WHERE a.id = application_requirements.application_id AND s.user_id = auth.uid()
    )
);

-- Application notes policies
CREATE POLICY "Users can manage own notes" ON application_notes FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Students can view notes on their applications" ON application_notes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a 
        JOIN students s ON s.id = a.student_id 
        WHERE a.id = application_notes.application_id AND s.user_id = auth.uid()
    )
);
CREATE POLICY "Parents can view notes on children's applications" ON application_notes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a 
        JOIN students s ON s.id = a.student_id 
        JOIN parent_student_relationships psr ON psr.student_id = s.id 
        WHERE a.id = application_notes.application_id AND psr.parent_id = auth.uid()
    )
);

-- Application events policies
CREATE POLICY "Students can view own application events" ON application_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a 
        JOIN students s ON s.id = a.student_id 
        WHERE a.id = application_events.application_id AND s.user_id = auth.uid()
    )
);
CREATE POLICY "System can create application events" ON application_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Parents can view children's application events" ON application_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a 
        JOIN students s ON s.id = a.student_id 
        JOIN parent_student_relationships psr ON psr.student_id = s.id 
        WHERE a.id = application_events.application_id AND psr.parent_id = auth.uid()
    )
);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_requirements_updated_at BEFORE UPDATE ON application_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_notes_updated_at BEFORE UPDATE ON application_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create application events on status changes
CREATE OR REPLACE FUNCTION create_application_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create event if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_events (application_id, event_type, event_description, event_data)
        VALUES (
            NEW.id,
            'status_change',
            'Application status changed from ' || COALESCE(OLD.status::text, 'null') || ' to ' || NEW.status::text,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'changed_by', auth.uid())
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER application_status_change_event 
    AFTER UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION create_application_event();

-- =============================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- =============================================

-- Insert some sample universities (you can expand this)
INSERT INTO universities (name, short_name, country, state, city, us_news_ranking, acceptance_rate, application_system, application_fee, tuition_out_state, deadlines) VALUES
('Stanford University', 'Stanford', 'United States', 'California', 'Stanford', 6, 3.95, 'Common App', 90, 56169, '{"early_action": "2024-11-01", "regular": "2025-01-05"}'),
('Massachusetts Institute of Technology', 'MIT', 'United States', 'Massachusetts', 'Cambridge', 2, 6.58, 'Direct', 75, 57986, '{"early_action": "2024-11-01", "regular": "2025-01-01"}'),
('Harvard University', 'Harvard', 'United States', 'Massachusetts', 'Cambridge', 3, 3.43, 'Common App', 85, 54269, '{"early_action": "2024-11-01", "regular": "2025-01-01"}'),
('University of California, Berkeley', 'UC Berkeley', 'United States', 'California', 'Berkeley', 22, 14.5, 'UC Application', 70, 46326, '{"regular": "2024-11-30"}'),
('Carnegie Mellon University', 'CMU', 'United States', 'Pennsylvania', 'Pittsburgh', 25, 11.3, 'Common App', 75, 59864, '{"early_decision": "2024-11-01", "regular": "2025-01-03"}')
