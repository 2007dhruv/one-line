-- Create the news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_id UUID DEFAULT auth.uid()
);

-- Index for faster date filtering
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can read news
CREATE POLICY "Allow public read access" ON public.news
    FOR SELECT USING (true);

-- 2. Only authenticated users can manage news (Admin)
CREATE POLICY "Allow authenticated to manage news" ON public.news
    FOR ALL USING (auth.role() = 'authenticated');

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated to manage categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial categories
INSERT INTO public.categories (name) VALUES 
('National'), ('International'), ('Science'), ('Economy'), ('Sports'), ('General')
ON CONFLICT (name) DO NOTHING;
