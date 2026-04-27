INSERT INTO public.page_content (page_name, section_key, content_value, content_type)
VALUES 
  ('about', 'paragraph_tv', 'The job. The family. The fucking big television.', 'text'),
  ('about', 'paragraph_4', 'And to be fair, now it''s your turn.', 'text'),
  ('about', 'paragraph_5', E'Choose life. Choose my job.\nChoose a fucking good copywriter.', 'text')
ON CONFLICT DO NOTHING;

UPDATE public.page_content
SET content_value = 'So I chose copywriting, social media, a small apparel business, even a sushi bar.'
WHERE page_name='about' AND section_key='paragraph_2';

UPDATE public.page_content
SET content_value = 'I sold it all. Apparently, what I really wanted was to become just like you.'
WHERE page_name='about' AND section_key='paragraph_3';