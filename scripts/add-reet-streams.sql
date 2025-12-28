-- Migration: Add REET Streams to Streams Table
-- Purpose: Add 4 REET exam streams for protocol support
-- Date: 2025-12-27
--
-- REET (Rajasthan Eligibility Examination for Teachers) has 2 separate exams:
-- 1. REET Pre (Eligibility exam) - Level 1 and Level 2
-- 2. REET Mains (Selection exam / 3rd Grade Teacher) - Level 1 and Level 2
--
-- This migration adds all 4 streams to support the protocol system

-- Insert REET streams
INSERT INTO public.streams (name) VALUES
  ('REET Level 1'),           -- Pre exam for Classes 1-5
  ('REET Level 2'),           -- Pre exam for Classes 6-8
  ('REET Mains Level 1'),     -- 3rd Grade Teacher exam for Classes 1-5
  ('REET Mains Level 2')      -- 3rd Grade Teacher exam for Classes 6-8
ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT id, name, created_at
FROM public.streams
WHERE name LIKE 'REET%'
ORDER BY name;
