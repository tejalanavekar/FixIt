-- Additive migration for the existing schema (users, learning_sessions, sandboxes, attempts already exist).
-- Run this once in the Supabase SQL editor.

-- "Learn More" drawer content (realWorldAnalogy, requestFlow, syntaxBreakdown) has no column yet —
-- stored here so resuming a session restores the exact same drawer content instead of losing it.
alter table sandboxes add column if not exists extra_data jsonb;

-- Tracks the user's in-progress edits to broken_code so resuming a session
-- picks up exactly where they left off instead of resetting to the original prompt.
alter table sandboxes add column if not exists current_code text;

-- Coarse completion percentage for the profile "Top Topics" progress bars:
-- 25 = sandbox generated (explanation visible), 50 = fix submitted,
-- 75 = quiz attempted, 100 = quiz answered correctly.
alter table sandboxes add column if not exists progress integer not null default 25;
