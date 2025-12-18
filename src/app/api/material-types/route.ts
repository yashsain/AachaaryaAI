import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/material-types
 *
 * Returns all material types (Notes, DPP, Past Papers, etc.)
 * Material types are universal (not institute-specific)
 *
 * Used for: Material type dropdown in upload form
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from request header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get teacher profile (just to verify valid session)
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    console.log(`[MATERIAL_TYPES_API] user_id=${teacher.id}`)

    // Fetch all material types (universal, no institute filtering)
    const { data: materialTypes, error: typesError } = await supabaseAdmin
      .from('material_types')
      .select('id, name')
      .order('name', { ascending: true })

    if (typesError) {
      console.error('[MATERIAL_TYPES_API_ERROR]', typesError)
      return NextResponse.json({ error: 'Failed to fetch material types' }, { status: 500 })
    }

    console.log(`[MATERIAL_TYPES_API_SUCCESS] types_count=${materialTypes?.length || 0}`)

    return NextResponse.json({ materialTypes }, { status: 200 })
  } catch (error) {
    console.error('[MATERIAL_TYPES_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
