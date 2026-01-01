/**
 * ESLint Configuration (Flat Config - ESLint 9+)
 *
 * Custom Auth Rules:
 * - Prevents direct supabase.auth.getSession() calls
 * - Only allows getSession in AuthContext, middleware, and set-password page
 * - Prevents using deprecated hooks from AuthContext
 * - Enforces use of centralized hooks from @/hooks/useSession
 */

import tsParser from '@typescript-eslint/parser'

export default [
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
    ],
  },
  {
    // Apply to all TypeScript and JavaScript files
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Forbid direct supabase.auth.getSession() calls
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.object.object.name="supabase"][callee.object.property.name="auth"][callee.property.name="getSession"]',
          message: 'Do not call supabase.auth.getSession() directly. Use useSession() hook instead. Only AuthContext and middleware are allowed to call getSession().'
        }
      ],

      // Prevent importing deprecated auth hooks from AuthContext
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/contexts/AuthContext',
              importNames: ['useRequireAuth'],
              message: 'useRequireAuth is deprecated. Use useRequireSession from "@/hooks/useSession" instead.'
            },
            {
              name: '@/contexts/AuthContext',
              importNames: ['useRequireAdmin'],
              message: 'useRequireAdmin from AuthContext is deprecated. Use useRequireAdmin from "@/hooks/useSession" instead.'
            }
          ]
        }
      ],
    },
  },
  {
    // Allow getSession in these files only
    files: [
      'src/contexts/AuthContext.tsx',
      'src/middleware.ts',
      'src/app/set-password/page.tsx', // Temporary exception
      'src/lib/auth/syncService.ts', // Auth sync service
    ],
    rules: {
      'no-restricted-syntax': 'off'
    }
  },
  {
    // Allow useAuth import in useSession.ts (internal use)
    files: ['src/hooks/useSession.ts'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
]
