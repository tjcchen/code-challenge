import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this application
    const { data: application } = await supabase
      .from('applications')
      .select(`
        *,
        student:students!inner(user_id)
      `)
      .eq('id', params.id)
      .eq('students.user_id', user.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Fetch requirements
    const { data: requirements, error } = await supabase
      .from('application_requirements')
      .select('*')
      .eq('application_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ requirements })
  } catch (error) {
    console.error('Error fetching requirements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabase()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      requirement_type,
      title,
      description,
      deadline,
      word_count_min,
      word_count_max,
      is_required
    } = body

    // Verify user owns this application
    const { data: application } = await supabase
      .from('applications')
      .select(`
        *,
        student:students!inner(user_id)
      `)
      .eq('id', params.id)
      .eq('students.user_id', user.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Create requirement
    const { data: requirement, error } = await supabase
      .from('application_requirements')
      .insert({
        application_id: params.id,
        requirement_type,
        title,
        description: description || null,
        deadline: deadline || null,
        word_count_min: word_count_min || null,
        word_count_max: word_count_max || null,
        is_required: is_required !== false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ requirement }, { status: 201 })
  } catch (error) {
    console.error('Error creating requirement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
