-- Create associados table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.associados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    popular_name TEXT,
    birthday DATE,
    age INTEGER,
    identity_document TEXT,
    document_id TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    category TEXT,
    position TEXT,
    club TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: Depending on your exact schema, some columns might have been missing.
-- If the table exists but is missing columns, run these ALTER TABLE statements:
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS popular_name TEXT;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS birthday DATE;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS age INTEGER;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS identity_document TEXT;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS category TEXT;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS position TEXT;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS club TEXT;
-- ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';

-- Enable RLS for associados
ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;

-- Setup Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND (raw_user_meta_data->>'is_admin')::boolean = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for associados
DO $$ BEGIN
  CREATE POLICY "Users can view their own profile" ON public.associados FOR SELECT USING (auth.uid()::text = user_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile" ON public.associados FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile" ON public.associados FOR UPDATE USING (auth.uid()::text = user_id::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin policies
DO $$ BEGIN
  CREATE POLICY "Admin can view all profiles" ON public.associados FOR SELECT USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can modify all profiles" ON public.associados FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create mensalidades table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mensalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associado_id UUID REFERENCES public.associados(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    payment_date DATE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Make month, year, associado_id unique per row, so no duplicate mensalidade for the same month/year
DO $$ BEGIN
    ALTER TABLE public.mensalidades ADD CONSTRAINT unique_mensalidade UNIQUE (associado_id, month, year);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- Enable RLS for mensalidades
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

-- Policies for mensalidades
DO $$ BEGIN
  CREATE POLICY "Users can view their own mensalidades" ON public.mensalidades FOR SELECT USING (associado_id IN (SELECT id FROM public.associados WHERE user_id::text = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can view all mensalidades" ON public.mensalidades FOR SELECT USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin can modify all mensalidades" ON public.mensalidades FOR ALL USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create Storage bucket if missing
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  CREATE POLICY "Avatars are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '-'))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (string_to_array(name, '-'))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
