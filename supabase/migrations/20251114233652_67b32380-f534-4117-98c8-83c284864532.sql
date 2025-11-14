-- Fix storage bucket security issues

-- 1. Remove public upload/update policies for project-photos bucket
DROP POLICY IF EXISTS "Anyone can upload project photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update project photos" ON storage.objects;

-- 2. Add admin-only policies for project-photos bucket
CREATE POLICY "Admins can upload project photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-photos' AND is_admin());

CREATE POLICY "Admins can update project photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-photos' AND is_admin());

CREATE POLICY "Admins can delete project photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-photos' AND is_admin());

-- 3. Remove public view policy for documents bucket
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;

-- 4. Add admin-only view policy for documents bucket
CREATE POLICY "Admins can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND is_admin());