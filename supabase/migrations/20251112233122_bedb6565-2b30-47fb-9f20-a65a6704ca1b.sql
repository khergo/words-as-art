-- Phase 1: Critical Database Security Fixes

-- 1. Lock Down Projects Table
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;

CREATE POLICY "Only admins can insert projects" 
  ON public.projects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update projects" 
  ON public.projects 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete projects" 
  ON public.projects 
  FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- 2. Lock Down Project Media Table
DROP POLICY IF EXISTS "Anyone can insert project media" ON public.project_media;
DROP POLICY IF EXISTS "Anyone can update project media" ON public.project_media;

CREATE POLICY "Only admins can insert project media" 
  ON public.project_media 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update project media" 
  ON public.project_media 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete project media" 
  ON public.project_media 
  FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- 3. Lock Down Page Content Table
DROP POLICY IF EXISTS "Anyone can insert page content" ON public.page_content;
DROP POLICY IF EXISTS "Anyone can update page content" ON public.page_content;

CREATE POLICY "Only admins can insert page content" 
  ON public.page_content 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update page content" 
  ON public.page_content 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete page content" 
  ON public.page_content 
  FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- 4. Add Admin Override for Profiles Table
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (public.is_admin());

-- 5. Add Missing DELETE Policy for Awards
CREATE POLICY "Only admins can delete awards" 
  ON public.awards 
  FOR DELETE 
  TO authenticated 
  USING (public.is_admin());