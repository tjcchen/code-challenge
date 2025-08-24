import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Fetch applications with related data
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        university:universities(*),
        requirements:application_requirements(*),
        notes:application_notes(*),
        events:application_events(*)
      `)
      .eq('student_id', student.id)
      .order('deadline', { ascending: true })

    if (error) throw error

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      university_id,
      application_type,
      intended_major,
      deadline,
      financial_aid_requested,
      scholarship_applied,
      notes,
      priority_level
    } = body

    // Get student ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        student_id: student.id,
        university_id,
        application_type,
        intended_major: intended_major || null,
        deadline,
        financial_aid_requested: financial_aid_requested || false,
        scholarship_applied: scholarship_applied || false,
        notes: notes || null,
        priority_level: priority_level || 3,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
