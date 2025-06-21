
-- Add the missing time tracking columns to the daily_tasks table
ALTER TABLE public.daily_tasks 
ADD COLUMN lecture_time INTEGER DEFAULT 0,
ADD COLUMN notes_time INTEGER DEFAULT 0,
ADD COLUMN homework_text TEXT,
ADD COLUMN homework_done BOOLEAN,
ADD COLUMN homework_time INTEGER DEFAULT 0,
ADD COLUMN modules_text TEXT,
ADD COLUMN modules_done BOOLEAN,
ADD COLUMN modules_time INTEGER DEFAULT 0,
ADD COLUMN pyqs_time INTEGER DEFAULT 0;
