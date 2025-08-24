import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase()
  const { searchParams } = new URL(request.url)
  
  try {
    let query = supabase
      .from('universities')
      .select('*')

    // Apply filters
    const search = searchParams.get('search')
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`)
    }

    const country = searchParams.get('country')
    if (country) {
      query = query.eq('country', country)
    }

    const state = searchParams.get('state')
    if (state) {
      query = query.eq('state', state)
    }

    const minRanking = searchParams.get('minRanking')
    const maxRanking = searchParams.get('maxRanking')
    if (minRanking) {
      query = query.gte('us_news_ranking', parseInt(minRanking))
    }
    if (maxRanking) {
      query = query.lte('us_news_ranking', parseInt(maxRanking))
    }

    const minAcceptance = searchParams.get('minAcceptance')
    const maxAcceptance = searchParams.get('maxAcceptance')
    if (minAcceptance) {
      query = query.gte('acceptance_rate', parseFloat(minAcceptance))
    }
    if (maxAcceptance) {
      query = query.lte('acceptance_rate', parseFloat(maxAcceptance))
    }

    // Apply sorting
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? false : true
    query = query.order(sortBy, { ascending: sortOrder })

    // Apply pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    
    query = query.range(offset, offset + limit - 1)

    const { data: universities, error, count } = await query

    if (error) throw error

    return NextResponse.json({ 
      universities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
