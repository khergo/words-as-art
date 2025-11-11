-- Create documents bucket for CVs and other files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create RLS policies for documents bucket
CREATE POLICY "Anyone can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND public.is_admin()
);

CREATE POLICY "Authenticated admins can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND public.is_admin());

CREATE POLICY "Authenticated admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND public.is_admin());