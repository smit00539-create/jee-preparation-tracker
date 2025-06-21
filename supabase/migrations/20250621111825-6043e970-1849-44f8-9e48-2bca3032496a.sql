
-- Create a table to track active study sessions for friends
CREATE TABLE public.active_study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL, -- lectures, notes, homework, modules, pyqs
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.active_study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for active study sessions
CREATE POLICY "Users can view their own sessions and friends' sessions" 
  ON public.active_study_sessions 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user1_id = auth.uid() AND user2_id = active_study_sessions.user_id)
         OR (user2_id = auth.uid() AND user1_id = active_study_sessions.user_id)
    )
  );

CREATE POLICY "Users can insert their own sessions" 
  ON public.active_study_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.active_study_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.active_study_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for active study sessions
ALTER TABLE public.active_study_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_study_sessions;
