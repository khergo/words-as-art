-- Create awards table
CREATE TABLE public.awards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view awards" 
ON public.awards 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert awards" 
ON public.awards 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update awards" 
ON public.awards 
FOR UPDATE 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_awards_updated_at
BEFORE UPDATE ON public.awards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial awards data
INSERT INTO public.awards (year, title, category, display_order) VALUES
  ('2024', 'Cannes Lions Gold', 'Creative Strategy', 1),
  ('2023', 'D&AD Pencil', 'Copywriting', 2),
  ('2023', 'One Show Gold', 'Brand Voice', 3),
  ('2022', 'Webby Award', 'Best Writing', 4),
  ('2022', 'Clio Award Silver', 'Integrated Campaign', 5);