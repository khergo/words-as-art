-- Drop the existing permissive policies that allow anyone to modify awards
DROP POLICY IF EXISTS "Anyone can insert awards" ON public.awards;
DROP POLICY IF EXISTS "Anyone can update awards" ON public.awards;

-- Create new admin-only policies for write operations
CREATE POLICY "Only admins can insert awards"
ON public.awards
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update awards"
ON public.awards
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- The public SELECT policy remains unchanged so visitors can still view awards