-- ============================================
-- Quiz Web App - Supabase Database Schema  
-- Using Supabase Authentication
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

-- User role enum: admin or intern
CREATE TYPE user_role AS ENUM ('admin', 'intern');

-- ============================================
-- 2. TABLES
-- ============================================

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'intern',
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_questions INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  passing_score INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options as JSON
  correct_option_index INTEGER NOT NULL, -- 0-based index
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL, -- Map of question_id -> selected_option_index
  score INTEGER,
  total_questions INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, quiz_id, started_at) -- Prevent duplicate submissions
);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------
-- PROFILES RLS POLICIES
-- ---------------------------------------------

-- Users can view all profiles
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can manage all profiles
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------
-- QUIZZES RLS POLICIES
-- ---------------------------------------------

-- Authenticated users can read active quizzes
CREATE POLICY "Authenticated users can view active quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can create quizzes
CREATE POLICY "Admins can create quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update/delete their own quizzes
CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can manage quizzes
CREATE POLICY "Service role can manage quizzes"
  ON quizzes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------
-- QUESTIONS RLS POLICIES
-- ---------------------------------------------

-- Authenticated users can view questions
CREATE POLICY "Authenticated users can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage questions
CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can manage questions
CREATE POLICY "Service role can manage questions"
  ON questions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------
-- SUBMISSIONS RLS POLICIES
-- ---------------------------------------------

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can manage all submissions
CREATE POLICY "Service role can manage submissions"
  ON submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. SECURE INTERN VIEW (Anti-Cheating Layer)
-- ============================================

-- View that excludes correct_option_index for interns
CREATE OR REPLACE VIEW intern_questions AS
SELECT 
  id,
  quiz_id,
  question_text,
  options,
  order_index,
  created_at
FROM questions;

-- Grant access to the view
GRANT SELECT ON intern_questions TO authenticated;

-- ============================================
-- 5. RPC FUNCTION - Server-Side Quiz Grading
-- ============================================

-- Function to grade a quiz submission
CREATE OR REPLACE FUNCTION grade_quiz(
  p_quiz_id UUID,
  p_user_id UUID,
  p_answers JSONB
)
RETURNS TABLE(
  submission_id UUID,
  score INTEGER,
  total_questions INTEGER,
  passed BOOLEAN
) AS $$
DECLARE
  v_submission_id UUID;
  v_score INTEGER := 0;
  v_total_questions INTEGER;
  v_passing_score INTEGER;
  v_passed BOOLEAN;
  v_question RECORD;
  v_user_answer INTEGER;
BEGIN
  -- Get quiz details
  SELECT 
    q.total_questions,
    q.passing_score
  INTO 
    v_total_questions,
    v_passing_score
  FROM quizzes q
  WHERE q.id = p_quiz_id;

  -- Calculate score by comparing answers
  FOR v_question IN 
    SELECT q.id, q.correct_option_index
    FROM questions q
    WHERE q.quiz_id = p_quiz_id
  LOOP
    -- Get user's answer for this question
    v_user_answer := (p_answers->v_question.id::text)::integer;
    
    -- Check if answer is correct
    IF v_user_answer = v_question.correct_option_index THEN
      v_score := v_score + 1;
    END IF;
  END LOOP;

  -- Determine if passed
  v_passed := v_score >= COALESCE(v_passing_score, v_total_questions * 0.7);

  -- Insert or update submission
  INSERT INTO submissions (
    user_id,
    quiz_id,
    answers,
    score,
    total_questions,
    status,
    completed_at
  ) VALUES (
    p_user_id,
    p_quiz_id,
    p_answers,
    v_score,
    v_total_questions,
    'completed',
    NOW()
  )
  ON CONFLICT (user_id, quiz_id, started_at)
  DO UPDATE SET
    answers = EXCLUDED.answers,
    score = EXCLUDED.score,
    status = 'completed',
    completed_at = NOW()
  RETURNING id INTO v_submission_id;

  -- Return results
  RETURN QUERY SELECT 
    v_submission_id,
    v_score,
    v_total_questions,
    v_passed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to update quiz total_questions count
CREATE OR REPLACE FUNCTION update_quiz_question_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quizzes
  SET total_questions = (
    SELECT COUNT(*)
    FROM questions
    WHERE quiz_id = COALESCE(NEW.quiz_id, OLD.quiz_id)
  )
  WHERE id = COALESCE(NEW.quiz_id, OLD.quiz_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update question count
CREATE TRIGGER update_quiz_count_on_question_change
  AFTER INSERT OR DELETE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_question_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Quizzes indexes
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_quizzes_is_active ON quizzes(is_active);

-- Questions indexes
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);

-- Submissions indexes
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_quiz_id ON submissions(quiz_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- 8. AUTO-CREATE PROFILE TRIGGER
-- ============================================

-- Trigger to automatically create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'intern')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after a user is inserted into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase auth.users';
COMMENT ON TABLE quizzes IS 'Quiz metadata created by admins';
COMMENT ON TABLE questions IS 'Quiz questions with correct answers (protected from interns)';
COMMENT ON TABLE submissions IS 'User quiz attempts and scores';
COMMENT ON VIEW intern_questions IS 'Secure view excluding correct answers for interns';
COMMENT ON FUNCTION grade_quiz IS 'Server-side quiz grading to prevent cheating';
