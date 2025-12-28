-- Migration: Add REET Paper Types to material_types Table
-- Purpose: Add REET-specific paper types for test paper generation

-- Add REET paper types
INSERT INTO public.material_types (name) VALUES
  ('REET Level 1 Paper'),
  ('REET Level 2 Paper'),
  ('REET Mains Level 1 Paper'),
  ('REET Mains Level 2 Paper'),
  ('DPP')  -- Daily Practice Paper - already exists but adding for completeness
ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT id, name, created_at
FROM public.material_types
WHERE name IN (
  'REET Level 1 Paper',
  'REET Level 2 Paper',
  'REET Mains Level 1 Paper',
  'REET Mains Level 2 Paper',
  'DPP',
  'NEET Paper',
  'JEE Mains Paper',
  'JEE Advanced Paper'
)
ORDER BY name;
