-- Migration: Add external learning platform link settings to courses/programs
-- Course/program admins can set a custom label and target URL for the JB
-- Learning and Platinum ED launch links shown on the student account (BEN-1191).
-- Null means the student-facing page falls back to the built-in platform
-- defaults defined in apps/webapp/lib/externalLearningLinks.ts (BEN-673/674).
ALTER TABLE courses
  ADD COLUMN jb_learning_label TEXT,
  ADD COLUMN jb_learning_url TEXT,
  ADD COLUMN platinum_ed_label TEXT,
  ADD COLUMN platinum_ed_url TEXT;
