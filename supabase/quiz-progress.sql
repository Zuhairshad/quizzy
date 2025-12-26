-- Create the quiz_progress table
create table if not exists public.quiz_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    quiz_id text not null, -- composite key: "topic-difficulty"
    current_question_index integer default 0,
    answers jsonb default '{}'::jsonb,
    score integer default 0,
    last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure user can only have one active progress per quiz
    unique(user_id, quiz_id)
);

-- Enable RLS
alter table public.quiz_progress enable row level security;

-- Create policies
create policy "Users can view their own progress"
    on public.quiz_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert/update their own progress"
    on public.quiz_progress for all
    using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists quiz_progress_user_id_idx on public.quiz_progress(user_id);
