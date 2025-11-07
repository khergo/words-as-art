-- Create projects table to store all project data
CREATE TABLE IF NOT EXISTS public.projects (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  year TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  full_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view projects
CREATE POLICY "Anyone can view projects"
ON public.projects
FOR SELECT
USING (true);

-- Anyone can update projects (edit mode will handle UI restrictions)
CREATE POLICY "Anyone can update projects"
ON public.projects
FOR UPDATE
USING (true);

-- Anyone can insert projects
CREATE POLICY "Anyone can insert projects"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- Create page_content table for other editable content
CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'text', 'image', 'rich_text'
  content_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_name, section_key)
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view page content
CREATE POLICY "Anyone can view page content"
ON public.page_content
FOR SELECT
USING (true);

-- Anyone can update page content
CREATE POLICY "Anyone can update page content"
ON public.page_content
FOR UPDATE
USING (true);

-- Anyone can insert page content
CREATE POLICY "Anyone can insert page content"
ON public.page_content
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial project data
INSERT INTO public.projects (id, title, category, description, year, icon_url, full_description) VALUES
(1, 'Nike Air Rebellion', 'Campaign Strategy', 'Redefining street culture through bold storytelling', '2024', '/src/assets/icon-lightbulb.png', 'A comprehensive campaign that redefined how Nike connects with urban youth culture. Through authentic storytelling and community engagement, we created a movement that resonated across social platforms.'),
(2, 'Spotify Mood Waves', 'Brand Voice', 'Emotional connection through music narratives', '2023', '/src/assets/icon-rocket.png', 'Developed a brand voice strategy that transformed how Spotify communicates with listeners. By focusing on emotional connections and personal music journeys, we deepened user engagement.'),
(3, 'Patagonia Wild Souls', 'Environmental Campaign', 'Stories that inspire action for the planet', '2023', '/src/assets/icon-star.png', 'An environmental campaign that inspired thousands to take action. Through powerful storytelling and grassroots engagement, we amplified Patagonia''s mission to protect our planet.'),
(4, 'Airbnb Local Legends', 'Content Strategy', 'Celebrating hidden gems and local hosts', '2024', '/src/assets/icon-pencil.png', 'A content strategy that highlighted the unique stories of Airbnb hosts around the world. We celebrated local culture and created authentic connections between travelers and communities.'),
(5, 'Apple Vision Dreams', 'Product Launch', 'Future of spatial computing, human-first', '2024', '/src/assets/icon-heart.png', 'Led the product launch narrative for Apple''s revolutionary spatial computing device. We focused on human-centered stories that made futuristic technology feel accessible and inspiring.'),
(6, 'Levi''s Worn Stories', 'Brand Heritage', 'Every thread tells a story worth keeping', '2023', '/src/assets/icon-megaphone.png', 'Celebrated Levi''s rich heritage through personal stories of beloved worn denim. Each piece became a chapter in a larger narrative about sustainability, memory, and timeless style.')
ON CONFLICT (id) DO NOTHING;