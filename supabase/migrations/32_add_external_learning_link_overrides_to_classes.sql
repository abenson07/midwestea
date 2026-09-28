-- Migration: Add per-class overrides for external learning platform links
-- When set, these override the course/program-level settings added in
-- migration 31 for this specific class (BEN-1192). Null means the class
-- inherits the course/program value (or the built-in platform default if
-- the course/program value is also null).
ALTER TABLE classes
  ADD COLUMN jb_learning_label TEXT,
  ADD COLUMN jb_learning_url TEXT,
  ADD COLUMN platinum_ed_label TEXT,
  ADD COLUMN platinum_ed_url TEXT;
