import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowLeft, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditableText } from "@/components/EditableText";
import { EditableImage } from "@/components/EditableImage";
import { useEdit } from "@/contexts/EditContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Helper function to convert video URLs to embeddable format
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Google Drive
  const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  
  return url;
};

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  year: string;
  icon_url: string;
  full_description: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { editMode } = useEdit();
  const [project, setProject] = useState<Project | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [prevProjectId, setPrevProjectId] = useState<number | null>(null);
  const [nextProjectId, setNextProjectId] = useState<number | null>(null);

  // Load all projects for navigation
  useEffect(() => {
    const loadAllProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error loading projects:', error);
      } else if (data) {
        setAllProjects(data);
      }
    };

    loadAllProjects();
  }, []);

  // Load project data and determine navigation
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', Number(projectId))
        .maybeSingle();

      if (error) {
        console.error('Error loading project:', error);
      } else if (data) {
        setProject(data);
        
        // Find prev and next project IDs
        const currentIndex = allProjects.findIndex(p => p.id === data.id);
        if (currentIndex !== -1) {
          setPrevProjectId(currentIndex > 0 ? allProjects[currentIndex - 1].id : null);
          setNextProjectId(currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1].id : null);
        }
      }
    };

    if (allProjects.length > 0) {
      loadProject();
    }
  }, [projectId, allProjects]);

  // Load project media from database
  useEffect(() => {
    const loadProjectMedia = async () => {
      if (!projectId) return;
      
      const { data, error } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', Number(projectId))
        .maybeSingle();

      if (error) {
        console.error('Error loading project media:', error);
      } else if (data) {
        setVideoUrl(data.video_url || "");
        setEmbedUrl(getEmbedUrl(data.video_url || ""));
        setPhotoUrls(data.photo_urls || []);
        setNotes(data.notes || "");
      }
      setLoading(false);
    };

    loadProjectMedia();
  }, [projectId]);

  // Save project media
  const saveProjectMedia = async (overrides?: Partial<{ video_url: string; photo_urls: string[]; notes: string }>) => {
    if (!projectId) return;

    const { data: existing } = await supabase
      .from('project_media')
      .select('id')
      .eq('project_id', Number(projectId))
      .maybeSingle();

    const mediaData = {
      project_id: Number(projectId),
      video_url: overrides?.video_url ?? videoUrl,
      photo_urls: overrides?.photo_urls ?? photoUrls,
      notes: overrides?.notes ?? notes,
    };

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('project_media')
        .update(mediaData)
        .eq('project_id', Number(projectId)));
    } else {
      ({ error } = await supabase
        .from('project_media')
        .insert(mediaData));
    }

    if (error) {
      toast({
        title: "Error saving",
        description: error.message || "Could not save project media. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved!",
        description: "Project media has been saved successfully.",
      });
    }
  };

  // Handle video URL input
  const handleVideoUrlSubmit = () => {
    const embed = getEmbedUrl(videoUrl);
    setEmbedUrl(embed);
    saveProjectMedia();
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotoUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}_${Math.random()}.${fileExt}`;

        console.log('Uploading file:', fileName);

        const { error: uploadError, data } = await supabase.storage
          .from('project-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: uploadError.message || `Could not upload ${file.name}`,
            variant: "destructive",
          });
        } else {
          console.log('Upload successful:', data);
          const { data: { publicUrl } } = supabase.storage
            .from('project-photos')
            .getPublicUrl(fileName);
          newPhotoUrls.push(publicUrl);
        }
      }

      if (newPhotoUrls.length > 0) {
        const updatedPhotoUrls = [...photoUrls, ...newPhotoUrls];
        console.log('Setting photo URLs:', updatedPhotoUrls);
        setPhotoUrls(updatedPhotoUrls);
        
        // Save to database immediately
        await saveProjectMedia({ photo_urls: updatedPhotoUrls });
        
        toast({
          title: "Success!",
          description: `${newPhotoUrls.length} photo(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Remove photo
  const removePhoto = async (url: string) => {
    const updated = photoUrls.filter(p => p !== url);
    setPhotoUrls(updated);
    await saveProjectMedia({ photo_urls: updated });
  };

  // Update project field
  const updateProject = async (field: string, value: string) => {
    if (!projectId || !project) return;

    const { error } = await supabase
      .from('projects')
      .update({ [field]: value })
      .eq('id', Number(projectId));

    if (!error) {
      setProject({ ...project, [field]: value });
      toast({
        title: "Saved!",
        description: "Project updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Could not update project.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen relative">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-handwritten text-5xl font-bold mb-4 text-[#1a1a1a]">
                Project Not Found
              </h1>
              <Link to="/work" className="text-[#dc3545] hover:underline font-handwritten">
                Back to Work
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#f6f6f6]">
      <Navigation />

      <main className="pt-24 pb-16 relative z-10">
        {/* Notebook paper texture */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            linear-gradient(transparent 0px, transparent 39px, #d4a574 39px, #d4a574 40px),
            linear-gradient(90deg, #e8c5a0 1px, transparent 1px)
          `,
          backgroundSize: '100% 40px, 40px 100%',
          backgroundPosition: '0 0, 80px 0'
        }} />

        {/* Red vertical margin line */}
        <div className="absolute left-[80px] top-0 bottom-0 w-[2px] bg-[#dc3545] opacity-60" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Project Navigation Arrows */}
          {prevProjectId && (
            <button
              onClick={() => navigate(`/work/${prevProjectId}`)}
              className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 z-20 group"
              aria-label="Previous project"
            >
              <ChevronLeft 
                size={48} 
                className="text-[#1a1a1a] opacity-60 hover:opacity-100 transition-all transform hover:scale-110 hover:-translate-x-1 stroke-[3] filter drop-shadow-[2px_2px_0px_rgba(220,53,69,0.3)]"
                style={{ 
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                }}
              />
            </button>
          )}
          
          {nextProjectId && (
            <button
              onClick={() => navigate(`/work/${nextProjectId}`)}
              className="hidden md:block fixed right-4 top-1/2 -translate-y-1/2 z-20 group"
              aria-label="Next project"
            >
              <ChevronRight 
                size={48} 
                className="text-[#1a1a1a] opacity-60 hover:opacity-100 transition-all transform hover:scale-110 hover:translate-x-1 stroke-[3] filter drop-shadow-[2px_2px_0px_rgba(220,53,69,0.3)]"
                style={{ 
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                }}
              />
            </button>
          )}

          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="mb-8">
              <Link
                to="/work"
                className="inline-flex items-center gap-2 text-lg md:text-xl font-handwritten text-[#666] hover:text-[#1a1a1a] transition-colors group"
              >
                <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                Back to Work
              </Link>
            </div>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-8">
                <EditableImage
                  src={project.icon_url}
                  alt={project.title}
                  onSave={(url) => updateProject('icon_url', url)}
                  className="w-full max-w-full md:max-w-3xl lg:max-w-5xl h-auto object-contain rounded-lg"
                  folder={`project-${projectId}`}
                />
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <EditableText
                  value={project.category}
                  onSave={(value) => updateProject('category', value)}
                  className="text-base font-handwritten font-medium text-[#dc3545] uppercase tracking-wider"
                  as="p"
                />
                <span className="text-base font-handwritten text-[#666]">•</span>
                <EditableText
                  value={project.year}
                  onSave={(value) => updateProject('year', value)}
                  className="text-base font-handwritten text-[#666]"
                  as="p"
                />
              </div>

              <EditableText
                value={project.title}
                onSave={(value) => updateProject('title', value)}
                className="font-handwritten text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-[#1a1a1a] transform -rotate-1"
                as="h1"
              />

              <EditableText
                value={project.description}
                onSave={(value) => updateProject('description', value)}
                className="text-lg sm:text-xl md:text-2xl font-handwritten text-[#666] mb-8 transform rotate-1"
                as="p"
              />
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 md:p-8 mb-8 transform -rotate-1 relative" style={{
              borderRadius: '8px 12px 10px 14px / 12px 8px 14px 10px',
              boxShadow: `
                0 0 0 2px #1a1a1a,
                1px 1px 0 2px #1a1a1a,
                -1px 0 0 2px #1a1a1a,
                0 -1px 0 2px #1a1a1a,
                2px 2px 0 2px #1a1a1a,
                3px 4px 0 1px rgba(0,0,0,0.3),
                4px 5px 0 1px rgba(0,0,0,0.2)
              `
            }}>
              <h2 className="font-handwritten text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#1a1a1a]">
                About This Project
              </h2>
              <EditableText
                value={project.full_description}
                onSave={(value) => updateProject('full_description', value)}
                className="font-handwritten text-base sm:text-lg md:text-xl text-[#333] leading-relaxed"
                as="p"
                multiline
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 mb-8 transform rotate-1 relative overflow-hidden" style={{
              borderRadius: '10px 14px 9px 13px / 11px 9px 13px 11px',
              boxShadow: `
                0 0 0 2px #1a1a1a,
                1px 0 0 2px #1a1a1a,
                0 1px 0 2px #1a1a1a,
                -1px 1px 0 2px #1a1a1a,
                2px 3px 0 2px #1a1a1a,
                4px 3px 0 1px rgba(0,0,0,0.3),
                5px 4px 0 1px rgba(0,0,0,0.2)
              `
            }}>
              {/* Decorative childlike pencil sketches - positioned around edges */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ zIndex: 0 }}>
                {projectId === '1' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Alexa/Tech theme - childlike sketches around edges */}
                    {/* Top left corner */}
                    <path d="M30,35 Q42,33 55,38 T75,42" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="95" cy="65" r="18" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M135,45 L152,68 L138,88" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M180,55 L195,48 L205,60 L192,72" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Top right corner */}
                    <path d="M680,40 Q695,37 710,43 T735,48" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="665" cy="80" r="15" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <rect x="745" y="65" width="28" height="32" rx="3" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M630,110 L645,95 L660,108" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom left corner */}
                    <path d="M35,520 L52,538 L42,558" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="95" cy="545" r="16" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M140,535 Q158,528 175,538" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M195,555 L210,540 L220,558" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom right corner */}
                    <path d="M700,535 Q715,530 730,538 T755,545" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <ellipse cx="665" cy="560" rx="20" ry="12" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M620,550 L638,538 L652,552 L640,568" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                  </svg>
                )}
                {projectId === '2' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* McDonald's/Food theme - childlike sketches around edges */}
                    {/* Top left corner */}
                    <circle cx="50" cy="50" r="22" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M28,75 Q40,85 50,75 Q60,85 72,75" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <ellipse cx="135" cy="65" rx="28" ry="18" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M185,55 Q198,48 210,58 Q222,48 235,58" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Top right corner */}
                    <rect x="690" y="40" width="42" height="58" rx="6" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M695,70 L727,70 M695,82 L727,82" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <circle cx="655" cy="95" r="19" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M745,75 L760,62 L772,78" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom left corner */}
                    <path d="M40,525 Q62,510 82,528 T122,535" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <rect x="145" y="535" width="38" height="42" rx="5" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="205" cy="555" r="17" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    {/* Bottom right corner */}
                    <circle cx="685" cy="545" r="20" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M675,545 L695,545 M685,535 L685,555" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <path d="M735,535 L748,525 L760,538 L752,553" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <ellipse cx="620" cy="560" rx="25" ry="15" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                  </svg>
                )}
                {projectId === '3' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* NairNairi/Fashion theme - childlike sketches around edges */}
                    {/* Top left corner */}
                    <path d="M35,60 Q48,45 60,62 Q72,45 85,62" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="130" cy="65" r="21" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M130,44 L130,86" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <path d="M175,55 Q185,48 195,58 L190,72 L180,72 Z" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Top right corner */}
                    <ellipse cx="685" cy="70" rx="27" ry="38" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M665,70 L685,48 L705,70" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="750" cy="85" r="18" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M630,95 Q642,88 655,98" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom left corner */}
                    <path d="M40,540 L58,522 L75,542 L60,560 Z" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="125" cy="550" r="18" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M125,532 L125,568" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <path d="M165,545 Q175,535 185,545 Q195,555 205,545" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom right corner */}
                    <ellipse cx="670" cy="550" rx="32" ry="22" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M725,540 Q735,532 745,542 Q755,532 765,542" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="620" cy="565" r="16" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                  </svg>
                )}
                {projectId === '4' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Panda/Nature theme - childlike sketches around edges */}
                    {/* Top left corner */}
                    <circle cx="60" cy="60" r="27" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <circle cx="52" cy="56" r="6" fill="#2a2a2a" opacity="0.6" />
                    <circle cx="68" cy="56" r="6" fill="#2a2a2a" opacity="0.6" />
                    <path d="M135,55 Q148,48 160,58 L150,72 Z" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M125,72 Q135,68 145,72" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="195" cy="75" r="17" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    {/* Top right corner */}
                    <path d="M685,70 L703,52 M703,70 L685,52" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" />
                    <circle cx="745" cy="80" r="21" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M730,80 L760,80 M745,65 L745,95" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <path d="M640,100 L658,88 L672,102" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom left corner */}
                    <path d="M35,530 Q55,515 75,532 L60,548 Z" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="125" cy="545" r="19" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M165,540 Q178,532 190,542 L180,558 Z" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom right corner */}
                    <path d="M685,540 Q705,525 725,542" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M745,535 L758,525 L770,538 L780,528" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="640" cy="560" r="18" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                  </svg>
                )}
                {projectId === '5' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Work 5 theme - childlike sketches around edges */}
                    {/* Top left corner */}
                    <circle cx="60" cy="60" r="24" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M40,90 L80,90" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" />
                    <rect x="135" y="50" width="38" height="32" rx="5" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M145,66 L163,66" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <ellipse cx="205" cy="70" rx="26" ry="16" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Top right corner */}
                    <path d="M680,55 Q700,48 720,58 Q740,68 760,58" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="650" cy="85" r="19" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M735,85 L752,68 L768,85 L755,102 Z" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom left corner */}
                    <path d="M35,540 Q58,530 80,542 T125,548" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="165" cy="555" r="18" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M155,555 L175,555 M165,545 L165,565" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <path d="M205,545 L222,532 L238,548" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom right corner */}
                    <circle cx="685" cy="550" r="22" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <path d="M675,550 L695,550 M685,540 L685,560" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" />
                    <ellipse cx="745" cy="555" rx="28" ry="18" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="625" cy="565" r="16" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                  </svg>
                )}
                {projectId === '6' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Work 6 theme - childlike sketches around edges */}
                    {/* Top left corner */}
                    <path d="M45,50 Q58,45 70,52 Q82,60 95,52" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="140" cy="70" r="20" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <ellipse cx="200" cy="65" rx="32" ry="20" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Top right corner */}
                    <rect x="685" y="48" width="40" height="38" rx="6" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M695,67 L715,67" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" />
                    <path d="M745,65 L762,52 L775,68 L765,85 Z" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="640" cy="95" r="17" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    {/* Bottom left corner */}
                    <path d="M40,535 Q62,525 82,538 Q102,548 122,538" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="165" cy="550" r="21" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                    <rect x="215" y="540" width="34" height="30" rx="5" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    {/* Bottom right corner */}
                    <path d="M670,545 L688,532 L705,548 L692,565 Z" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <path d="M735,555 Q748,548 760,558" stroke="#2a2a2a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1,1" fill="none" />
                    <circle cx="625" cy="560" r="19" stroke="#2a2a2a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2,1" fill="none" />
                  </svg>
                )}
              </div>
              {/* Video and Photo Upload Section - Only visible in edit mode */}
              {editMode && (
                <div className="space-y-6 mb-6 relative" style={{ zIndex: 1 }}>
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <label className="font-handwritten text-xl font-medium text-[#1a1a1a] mb-2 block">
                      Embed Video (YouTube, Vimeo, or Google Drive)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste video URL here..."
                        className="font-handwritten border-2 border-[#1a1a1a] bg-white focus:border-[#dc3545]"
                      />
                      <Button
                        onClick={handleVideoUrlSubmit}
                        className="font-handwritten bg-[#dc3545] hover:bg-[#c82333] text-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all whitespace-nowrap"
                      >
                        Embed Video
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <label className="font-handwritten text-xl font-medium text-[#1a1a1a] mb-2 block">
                      Upload Photos
                    </label>
                    <div className="border-2 border-dashed border-[#666] rounded-lg p-8 text-center bg-white">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-[#666]" />
                      <p className="font-handwritten text-lg text-[#666] mb-3">
                        {uploading ? "Uploading..." : "Click to upload photos"}
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          variant="outline"
                          className="font-handwritten border-2 border-[#1a1a1a] bg-white hover:bg-[#dc3545] hover:text-white hover:border-[#dc3545] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                          disabled={uploading}
                          asChild
                        >
                          <span className="cursor-pointer">Choose Photos</span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Unified Media Carousel - Shows both video and photos */}
              {(embedUrl || photoUrls.length > 0) && (
                <div className="relative px-4 sm:px-8 md:px-12" style={{ zIndex: 1 }}>
                  <Carousel className="w-full">
                    <CarouselContent>
                     {/* Photo Slides - shown first */}
                       {photoUrls.map((url, index) => (
                         <CarouselItem key={`photo-${index}`}>
                           <div className="relative group flex justify-center items-center rounded-lg min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                             <img
                               src={url}
                               alt={`Project photo ${index + 1}`}
                               className="w-full h-full max-h-[70vh] sm:max-h-[75vh] md:max-h-[85vh] object-contain rounded-lg"
                               loading="lazy"
                             />
                            {editMode && (
                              <button
                                onClick={() => removePhoto(url)}
                                className="absolute top-2 right-2 bg-[#dc3545] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-[#c82333]"
                                aria-label="Remove photo"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                      
                      {/* Video Slide - shown last if video exists */}
                      {embedUrl && (
                         <CarouselItem>
                           <div className="relative flex justify-center items-center rounded-lg min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                             <div className="relative w-full aspect-video max-h-[70vh] sm:max-h-[75vh] md:max-h-[85vh]">
                              <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Project video"
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    {(photoUrls.length + (embedUrl ? 1 : 0)) > 1 && (
                      <>
                        <CarouselPrevious className="font-handwritten border-2 border-[#1a1a1a] bg-white hover:bg-[#dc3545] hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -left-1 md:-left-2" />
                        <CarouselNext className="font-handwritten border-2 border-[#1a1a1a] bg-white hover:bg-[#dc3545] hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -right-1 md:-right-2" />
                      </>
                    )}
                  </Carousel>
                </div>
              )}

              {!editMode && !embedUrl && photoUrls.length === 0 && (
                <p className="font-handwritten text-xl text-[#666] text-center py-8">
                  No media available for this project yet.
                </p>
              )}
            </div>

            {editMode && (
              <div className="bg-white/60 backdrop-blur-sm p-8 transform -rotate-1 relative" style={{
                borderRadius: '9px 13px 11px 12px / 13px 10px 12px 9px',
                boxShadow: `
                  0 0 0 2px #1a1a1a,
                  1px 1px 0 2px #1a1a1a,
                  -1px 0 0 2px #1a1a1a,
                  0 -1px 0 2px #1a1a1a,
                  2px 2px 0 2px #1a1a1a,
                  3px 4px 0 1px rgba(0,0,0,0.3),
                  4px 5px 0 1px rgba(0,0,0,0.2)
                `
              }}>
                <h2 className="font-handwritten text-4xl font-bold mb-6 text-[#1a1a1a]">
                  Additional Notes (Editor Only)
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[200px] p-4 font-handwritten text-xl border-2 border-[#666] rounded-lg bg-white/80 focus:outline-none focus:border-[#dc3545] transition-colors resize-none"
                  placeholder="Add your project notes, insights, or additional details here..."
                />
                <Button
                  onClick={() => saveProjectMedia()}
                  className="mt-4 font-handwritten bg-[#dc3545] hover:bg-[#c82333] text-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  Save Notes
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
