-- Create a table to track user terms and privacy policy acceptances
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    terms_version TEXT NOT NULL,
    privacy_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user_id ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_email ON public.terms_acceptances(email);

-- Create a Row Level Security policy for the terms_acceptances table
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Admins can see all acceptances
CREATE POLICY "Admins can see all terms acceptances" 
ON public.terms_acceptances 
FOR SELECT 
USING (
    auth.uid() IN (
        SELECT auth.uid() FROM auth.users 
        WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Users can insert their own acceptance records but can't update or delete them
CREATE POLICY "Users can insert their own terms acceptances" 
ON public.terms_acceptances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add comment explaining the table purpose
COMMENT ON TABLE public.terms_acceptances IS 'Tracks when users accept terms of service and privacy policy for legal compliance.'; 