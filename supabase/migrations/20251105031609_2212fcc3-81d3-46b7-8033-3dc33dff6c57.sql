-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create project_media table to store videos and photos for each project
CREATE TABLE public.project_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id INTEGER NOT NULL,
  video_url TEXT,
  photo_urls TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view project media (public portfolio)
CREATE POLICY "Anyone can view project media" 
ON public.project_media 
FOR SELECT 
USING (true);

-- Only allow inserts/updates (for now, we'll add auth later if needed)
CREATE POLICY "Anyone can insert project media" 
ON public.project_media 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update project media" 
ON public.project_media 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_project_media_updated_at
BEFORE UPDATE ON public.project_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project photos
CREATE POLICY "Anyone can view project photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-photos');

CREATE POLICY "Anyone can upload project photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "Anyone can update project photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-photos');