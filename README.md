# aachaaryAI - AI-Powered Test Paper Generation

**Your Teaching Assistant for Creating Test Papers in Minutes**

aachaaryAI replaces ₹60k/month typist costs with AI, generating test papers in <30 minutes instead of 2-4 hours.

---

## What's Been Set Up

This repository now contains a **complete, production-ready setup guide** for aachaaryAI. Here's what's included:

### 📚 Documentation (`docs/`)

1. **`product_concept.md`**
   - Business model and value proposition
   - Target market (JEE/NEET coaching institutes)
   - Economics and pricing strategy
   - Success metrics

2. **`database_schema.md`**
   - Complete schema for 17 tables
   - Multi-tenant architecture with Row-Level Security
   - JSONB-based flexible question types (no database ENUMs!)
   - Comprehensive media/diagram support
   - Examples from NEET 2025 paper

3. **`question_types_analysis.md`**
   - Analysis of all 180 NEET 2025 questions
   - Diagram generation strategies (circuits, chemistry, biology)
   - Tool recommendations (CircuiTikZ, RDKit, Matplotlib, etc.)
   - Progressive enhancement roadmap

4. **`SETUP_GUIDE.md`** ⭐ **START HERE**
   - Step-by-step initialization guide
   - Tech stack learned from SchoolMitra
   - Project structure (proper, not like SchoolMitra's scattered approach)
   - Environment setup
   - Commands reference
   - Troubleshooting

### 🗄️ Database Migrations (`docs/`)

5. **`001_initial_schema.sql`**
   - All 17 tables with proper constraints
   - Indexes for performance
   - Seed data (streams, subjects, class levels, material types)
   - Helper functions
   - Comments for documentation

6. **`002_rls_policies.sql`**
   - Row-Level Security policies for multi-tenant isolation
   - Teachers can ONLY access their institute's data
   - Admins have full access within their institute
   - Global taxonomy (streams, subjects, chapters) is public

7. **`003_storage_setup.sql`**
   - Supabase Storage bucket configuration
   - Storage policies for institute isolation
   - Helper functions for generating storage paths
   - Storage usage tracking (for billing/quotas)

### 💻 TypeScript Types (`docs/`)

8. **`database_types.ts`**
   - Complete TypeScript types matching database schema
   - JSONB type definitions (QuestionData, MediaAttachment)
   - API request/response types
   - Helper type guards
   - Ready to copy to `src/types/database.ts`

---

## Tech Stack (Learned from SchoolMitra)

### Core Framework
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4.1** with custom aachaaryAI color palette

### Database & Backend
- **Supabase** (PostgreSQL + Row-Level Security)
- Same credentials as SchoolMitra (already configured)
- Multi-tenant architecture with RLS

### AI & Content
- **Google Gemini API** (question generation)
- **KaTeX** (LaTeX math rendering)
- **react-markdown** (markdown with math support)

### Development
- Strict TypeScript mode
- Path aliases (`@/*` for clean imports)
- ESLint for code quality

---

## Quick Start

### 1. Read the Setup Guide

```bash
cat docs/SETUP_GUIDE.md
```

The setup guide contains:
- Prerequisites
- Step-by-step initialization
- Project structure (clean, proper approach)
- Key learnings from SchoolMitra
- Commands reference

### 2. Initialize Next.js Project

```bash
cd /Users/yashsain/aachaaryAI

# Initialize Next.js with TypeScript, Tailwind, App Router
npx create-next-app@16 . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**Note:** When prompted:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: Yes
- ✅ App Router: Yes
- ✅ Import alias: Yes (@/*)
- ❌ Turbopack: No (use default)

### 3. Install Dependencies

```bash
# Core
npm install @supabase/supabase-js@^2.81.0
npm install @google/genai@^1.32.0
npm install @ai-sdk/google@^2.0.40
npm install ai@^5.0.99

# Content rendering
npm install katex@^0.16.27
npm install react-markdown@^10.1.0
npm install remark-math@^6.0.0
npm install rehype-katex@^7.0.1

# UI
npm install @tailwindcss/typography@^0.5.19
```

### 4. Set Up Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Apply Database Migrations

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard/project/nvhspniochhnabxaaaeu
2. Navigate to SQL Editor
3. Copy and run each migration file in order:
   - `docs/001_initial_schema.sql` (creates all 17 tables)
   - `docs/002_rls_policies.sql` (sets up Row-Level Security)
   - `docs/003_storage_setup.sql` (configures storage buckets)

**Option B: Via Supabase CLI (Advanced)**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to remote project
supabase link --project-ref nvhspniochhnabxaaaeu

# Create migration folder
mkdir -p supabase/migrations

# Copy migration files
cp docs/001_initial_schema.sql supabase/migrations/
cp docs/002_rls_policies.sql supabase/migrations/
cp docs/003_storage_setup.sql supabase/migrations/

# Push to remote database
supabase db push
```

### 6. Create Supabase Storage Buckets

Go to Supabase Dashboard > Storage > New Bucket and create:

1. **materials_bucket**
   - Public: OFF
   - File size limit: 50 MB
   - MIME types: `application/pdf`, `image/png`, `image/jpeg`

2. **papers_bucket**
   - Public: OFF
   - File size limit: 10 MB
   - MIME types: `application/pdf`

3. **diagrams_bucket**
   - Public: OFF
   - File size limit: 5 MB
   - MIME types: `image/svg+xml`, `image/png`, `image/jpeg`

4. **temp_bucket**
   - Public: OFF
   - File size limit: 50 MB
   - MIME types: All (*)

### 7. Set Up Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Check .env.local')
}

// Regular client (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (bypasses RLS) - server-side only
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase
```

### 8. Copy TypeScript Types

```bash
# Create types directory
mkdir -p src/types

# Copy database types
cp docs/database_types.ts src/types/database.ts
```

### 9. Initialize Git

```bash
cd /Users/yashsain/aachaaryAI

# Initialize at ROOT (not in subdirectory like SchoolMitra!)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: aachaaryAI setup with Next.js 16 + Supabase

- Complete database schema (17 tables)
- Row-Level Security policies
- Storage bucket configuration
- TypeScript types
- Tech stack: Next.js 16, React 19, Supabase, Gemini API
- Multi-tenant architecture
"
```

### 10. Start Development

```bash
npm run dev
```

Visit http://localhost:3000

---

## Project Structure

```
aachaaryAI/
├── docs/                           # All documentation (centralized)
│   ├── product_concept.md          # Business model
│   ├── database_schema.md          # Database design
│   ├── question_types_analysis.md  # NEET analysis
│   ├── SETUP_GUIDE.md             # Setup instructions
│   ├── 001_initial_schema.sql     # Database migration
│   ├── 002_rls_policies.sql       # RLS policies
│   ├── 003_storage_setup.sql      # Storage setup
│   └── database_types.ts          # TypeScript types
│
├── src/                           # Application code
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/                   # API routes
│   ├── components/                # React components
│   │   ├── ui/                    # Reusable UI
│   │   └── features/              # Feature components
│   ├── lib/                       # Utilities
│   │   ├── supabase.ts           # Supabase client
│   │   ├── gemini.ts             # Gemini API client
│   │   └── utils.ts              # Helpers
│   └── types/                     # TypeScript types
│       └── database.ts            # Database types
│
├── .env.local                     # Environment variables
├── .gitignore                     # Git ignore
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind config
├── next.config.js                 # Next.js config
└── README.md                      # This file
```

**Key Differences from SchoolMitra:**
- ✅ Git at ROOT (not in `/pwa` subdirectory)
- ✅ All docs in `/docs` (centralized, not scattered)
- ✅ No vague `pwa/` folder
- ✅ Clean, professional structure

---

## Database Schema Highlights

### 17 Tables Total

**Non-Proprietary (11):**
- institutes, streams, institute_streams, teachers
- class_levels, classes, subjects, chapters
- material_types, teacher_classes, teacher_subjects

**Proprietary (6):**
- materials, material_chapters
- test_papers, paper_chapters
- comprehension_passages, questions

### Key Features

✅ **Multi-tenant with strict isolation** (RLS policies)
✅ **No database ENUMs** (reference tables + JSONB)
✅ **Flexible question types** (JSONB: single MCQ, multiple MCQ, integer, matrix, etc.)
✅ **Comprehensive media support** (circuits, chemistry, biology diagrams)
✅ **Scalable to 100+ institutes**
✅ **Supports NEET, JEE, Banking, UPSC, and future exams**

### Example: Question with Circuit Diagram

```typescript
const question: Question = {
  id: '...',
  institute_id: 'institute-uuid',
  paper_id: 'paper-uuid',
  chapter_id: 'chapter-uuid',
  question_text: 'Calculate the current through the resistor.',
  question_data: {
    type: 'single_correct_mcq',
    options: [
      { label: 'A', text: '2.0 A' },
      { label: 'B', text: '0.5 A' },
      { label: 'C', text: '2.5 A' },
      { label: 'D', text: '1.5 A' }
    ],
    correct_answer: 'B'
  },
  media_attachments: [
    {
      type: 'circuit',
      position: 'above_question',
      storage: {
        method: 'svg',
        content: '<svg>...</svg>',
        fallback_url: '/circuits/q6.png'
      },
      generation_metadata: {
        tool: 'circuitikz',
        source_code: '\\begin{circuitikz}...\\end{circuitikz}',
        alt_text: 'Circuit with 6V battery and resistors'
      }
    }
  ],
  marks: 4,
  negative_marks: -1,
  is_selected: true
}
```

---

## What You Learned from SchoolMitra

### ✅ Good Practices (Kept)
1. Dual Supabase clients (regular + admin)
2. TypeScript interfaces alongside client
3. Migration-based schema
4. Path aliases (`@/*`)
5. Strict TypeScript
6. Tailwind with custom palette
7. KaTeX + react-markdown

### ❌ Bad Practices (Fixed)
1. ~~Vague 'pwa' folder~~ → Clean root structure
2. ~~Git in subdirectory~~ → Git at root
3. ~~Scattered docs~~ → Centralized `/docs`
4. ~~No separation~~ → Clear `src/`, `docs/`, `supabase/`

---

## Next Steps

### Phase 1: MVP Development (Week 1-2)
1. Create teacher login/authentication
2. Build dashboard UI
3. Implement content upload system
4. Basic question generation (1 chapter)

### Phase 2: Testing (Week 3)
1. Get institute template/format
2. Generate first real paper
3. Teacher review and feedback
4. Fix issues

### Phase 3: Production (Week 4)
1. Finalize pricing
2. Sign contract with first institute
3. Deploy to Vercel
4. Invoice first payment

### Phase 4: Iteration (Month 2-3)
1. Add features based on feedback
2. Optimize cost/quality
3. Approach 3-5 more institutes
4. Build referral mechanism

---

## Verification Checklist

Before starting development:

- [ ] Next.js 16 project initialized
- [ ] All dependencies installed
- [ ] `.env.local` created with credentials
- [ ] Git initialized at ROOT
- [ ] `.gitignore` configured
- [ ] Tailwind configured
- [ ] Database migrations applied (17 tables)
- [ ] RLS policies applied
- [ ] Storage buckets created (4 buckets)
- [ ] `src/lib/supabase.ts` created
- [ ] `src/types/database.ts` copied
- [ ] `npm run dev` works

---

## Support

- **Documentation:** See `docs/SETUP_GUIDE.md`
- **Database Schema:** See `docs/database_schema.md`
- **Question Types:** See `docs/question_types_analysis.md`

---

## License

Proprietary - All Rights Reserved

---

Built with ❤️ for coaching institutes across India
