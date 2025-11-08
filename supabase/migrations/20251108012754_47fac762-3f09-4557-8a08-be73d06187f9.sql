-- Add page content entries for About and Contact pages

-- About page content
INSERT INTO page_content (page_name, section_key, content_type, content_value) VALUES
('about', 'title', 'text', 'About Me'),
('about', 'intro', 'text', 'I''m a creative copywriter and strategist who believes great words can change how people see the world — and themselves.'),
('about', 'paragraph_1', 'text', 'Over the past decade, I''ve worked with brands like Nike, Spotify, Apple, and Patagonia to create campaigns that don''t just sell products — they tell stories, spark movements, and win awards.'),
('about', 'paragraph_2', 'text', 'My approach is simple: understand the human truth, find the unexpected angle, and craft words that feel like they were meant to be said. Whether it''s a 15-second film script or a brand manifesto, I write to make people feel something real.'),
('about', 'paragraph_3', 'text', 'When I''m not writing campaigns, you''ll find me reading fiction, collecting vintage posters, or arguing that the best ads are the ones you remember without trying.'),
('about', 'profile_image', 'image', ''),
('about', 'awards_title', 'text', 'Awards & Recognition')
ON CONFLICT DO NOTHING;

-- Contact page content
INSERT INTO page_content (page_name, section_key, content_type, content_value) VALUES
('contact', 'title', 'text', 'Let''s make something worth talking about.'),
('contact', 'subtitle', 'text', 'Have a project in mind? Let''s chat.'),
('contact', 'direct_contact_text', 'text', 'Or reach me directly at'),
('contact', 'email', 'text', 'hello@giorgikhergiani.com')
ON CONFLICT DO NOTHING;