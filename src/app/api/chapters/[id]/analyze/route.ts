/**
 * API Route: Analyze Chapter Materials
 *
 * POST /api/chapters/[id]/analyze
 *
 * Triggers analysis of materials for a chapter:
 * - Extracts scope (topics, subtopics) from theory materials
 * - Extracts style (sample questions) from practice papers
 * - Stores results in chapter_knowledge table
 *
 * Part of: PDF Analysis Caching System
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { analyzeChapterMaterials } from '@/lib/ai/analysisOrchestrator';

// Allow long-running analysis (5 minutes)
export const maxDuration = 300;

/**
 * POST /api/chapters/[id]/analyze
 *
 * Triggers material analysis for a chapter
 *
 * Request body (optional):
 * {
 *   material_id?: string  // Analyze only this material (for incremental updates)
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   chapter_id: string
 *   institute_id: string
 *   status: 'completed' | 'failed'
 *   materials_analyzed: number
 *   scope_materials: number
 *   style_materials: number
 *   token_usage?: {
 *     total_tokens: number
 *     cost_usd: number
 *     cost_inr: number
 *   }
 *   error?: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chapterId } = await params;

    // Parse request body (optional)
    let materialId: string | undefined;
    try {
      const body = await req.json();
      materialId = body.material_id;
    } catch {
      // No body or invalid JSON - that's okay
    }

    console.log('[ANALYZE_API] Request:', {
      chapterId,
      materialId: materialId || 'all',
    });

    // Step 1: Authenticate and get teacher
    const supabase = createServerClient(await cookies());
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[ANALYZE_API] Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Step 2: Get teacher record
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, institute_id')
      .eq('id', user.id)
      .single();

    if (teacherError || !teacher) {
      console.error('[ANALYZE_API] Teacher not found:', teacherError);
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Step 3: Verify chapter exists and belongs to institute
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, name, subject_id')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      console.error('[ANALYZE_API] Chapter not found:', chapterError);
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Step 4: Run analysis
    console.log('[ANALYZE_API] Starting analysis for:', {
      chapter: chapter.name,
      institute: teacher.institute_id,
    });

    const result = await analyzeChapterMaterials(
      chapterId,
      teacher.institute_id,
      materialId
    );

    // Step 5: Return result
    if (result.success) {
      console.log('[ANALYZE_API_SUCCESS]', result);
      return NextResponse.json(result, { status: 200 });
    } else {
      console.error('[ANALYZE_API_FAILED]', result);
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('[ANALYZE_API_EXCEPTION]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}
