-- Analytics Tables
CREATE TABLE IF NOT EXISTS quiz_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  questions_total INT NOT NULL,
  questions_answered INT NOT NULL,
  correct_answers INT NOT NULL,
  time_taken_seconds INT,
  completed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_id INT NOT NULL,
  was_correct BOOLEAN NOT NULL,
  time_taken_seconds INT,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  email TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  time_taken_seconds INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_topic ON quiz_analytics(topic);
CREATE INDEX IF NOT EXISTS idx_quiz_difficulty ON quiz_analytics(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_performance ON question_analytics(topic, difficulty, question_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(topic, difficulty, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard(email);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard(created_at DESC);
