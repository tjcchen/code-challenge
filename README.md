# University Application Tracking System

A comprehensive university application management platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Project Overview

This system helps high school students track their university applications (8-15 universities) across different application systems (Common App, Coalition App, Direct Applications) while managing deadlines, requirements, and decisions. Parents can monitor their children's application status and provide support.

## 🏗️ Database Schema

The complete Supabase schema is available in `supabase-schema.sql` with the following key features:

### Core Tables
- **profiles**: User profiles extending Supabase auth
- **students**: Academic profiles with GPA, test scores, intended majors
- **universities**: Comprehensive university data with rankings, deadlines, costs
- **applications**: Application tracking with status workflow
- **application_requirements**: Detailed requirement tracking (essays, transcripts, etc.)

### Role-Based Access Control
- **Students**: Full CRUD access to their applications
- **Parents**: Read-only access to children's applications + note-taking
- **Extensible**: Ready for teachers/admins in future

### Key Features
- ✅ Application status workflow: Not Started → In Progress → Submitted → Under Review → Decision
- ✅ Application types: Early Decision, Early Action, Regular Decision, Rolling Admission
- ✅ Deadline management with automated alerts
- ✅ Requirement tracking (essays, transcripts, recommendations, etc.)
- ✅ Parent-student relationships
- ✅ Row Level Security (RLS) policies
- ✅ Automated event logging and triggers

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Run the SQL to create all tables, policies, and sample data
5. Go to Settings > API to get your project URL and keys

### 3. Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Configure Authentication
1. In Supabase Dashboard, go to Authentication > Settings
2. Add your site URL: `http://localhost:3000`
3. Configure OAuth providers (Google, GitHub) if desired
4. Set redirect URLs: `http://localhost:3000/auth/callback`

### 5. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to start using the application!

## 📊 Database Schema Highlights

### Application Status Workflow
```
not_started → in_progress → submitted → under_review → [accepted|rejected|waitlisted|deferred]
```

### Application Types
- `early_decision`: Binding early application
- `early_action`: Non-binding early application  
- `regular_decision`: Standard application timeline
- `rolling_admission`: No fixed deadline

### Requirement Types
- Personal essays, supplemental essays
- Transcripts, recommendation letters
- Test scores, portfolios
- Interviews, application fees
- Financial aid forms (FAFSA, CSS Profile)

### Sample Universities Included
- Stanford University
- MIT
- Harvard University
- UC Berkeley
- Carnegie Mellon University

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure parent-student relationships
- Automated audit logging via triggers
- JWT-based authentication

## 📱 Planned Features

### Student Dashboard
- Application overview with progress indicators
- Deadline calendar with visual alerts
- University comparison tools
- Quick stats and progress tracking

### Parent Dashboard
- Read-only view of child's applications
- Financial planning integration
- Communication and note-taking
- Progress monitoring

## 🛠️ TypeScript Support

Complete TypeScript definitions are available in `types/database.ts` including:
- Database table types
- Enum definitions
- Helper types for relationships
- Dashboard-specific interfaces

## 📋 Business Rules Implemented

1. **Deadline Management**: Automatic alerts for approaching deadlines
2. **Status Validation**: Proper workflow enforcement
3. **Role Permissions**: Students manage, parents observe
4. **Data Integrity**: Foreign key constraints and validation
5. **Audit Trail**: Automatic event logging for status changes

## 🎨 UI/UX Considerations

- Responsive design (mobile-first)
- Accessibility compliance (WCAG 2.1 AA)
- Clear visual hierarchy for non-technical users
- Loading states and error handling
- Progress visualization and status indicators
