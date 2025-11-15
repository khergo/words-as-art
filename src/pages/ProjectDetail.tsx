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
              {/* Decorative hand-drawn pencil sketches background */}
              <div className="absolute inset-0 pointer-events-none opacity-12" style={{ zIndex: 0 }}>
                {projectId === '1' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Alexa/Tech theme - more sketches */}
                    <path d="M50,50 Q60,45 70,50 T90,50" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="100" cy="80" r="15" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M150,60 L170,80 L150,100" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M700,100 Q710,95 720,100 T740,100" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="680" cy="150" r="12" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M50,500 L70,520 L50,540" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M720,500 Q730,495 740,500 T760,500" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    {/* Additional tech elements */}
                    <rect x="200" y="70" width="30" height="25" rx="3" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M210,82 L220,82" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="600" cy="120" r="18" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M590,120 L610,120 M600,110 L600,130" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M120,540 Q140,530 160,540" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M650,530 L670,545 L680,530" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
                {projectId === '2' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* McDonald's/Food theme - more sketches */}
                    <circle cx="60" cy="60" r="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M40,80 Q50,90 60,80 Q70,90 80,80" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="700" y="50" width="40" height="60" rx="5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M705,80 L735,80 M705,90 L735,90" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M100,500 Q120,480 140,500 T180,500" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="700" cy="520" r="18" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M690,520 L710,520 M700,510 L700,530" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <ellipse cx="150" cy="100" rx="25" ry="15" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Additional food elements */}
                    <path d="M200,80 Q210,70 220,80 Q230,90 240,80" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="580" cy="100" r="22" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M560,100 Q570,95 580,100 Q590,105 600,100" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="220" y="510" width="35" height="40" rx="4" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M600,540 L610,530 L620,540 L630,530" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
                {projectId === '3' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* NairNairi/Fashion theme - more sketches */}
                    <path d="M50,70 Q60,50 70,70 Q80,50 90,70" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="700" cy="80" r="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M700,60 L700,100" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M120,520 L140,500 L160,520 L140,540 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <ellipse cx="680" cy="520" rx="30" ry="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M150,80 C150,60 170,60 170,80 C170,60 190,60 190,80" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    {/* Additional fashion elements */}
                    <path d="M220,60 Q230,50 240,60 L235,70 L225,70 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <ellipse cx="600" cy="110" rx="25" ry="35" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M580,110 L600,85 L620,110" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="220" cy="530" r="16" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M220,514 L220,546" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M580,540 Q590,530 600,540 Q610,530 620,540" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
                {projectId === '4' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Panda/Nature theme - more sketches */}
                    <circle cx="70" cy="70" r="25" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <circle cx="60" cy="65" r="5" fill="#1a1a1a" />
                    <circle cx="80" cy="65" r="5" fill="#1a1a1a" />
                    <path d="M700,80 L720,60 M720,80 L700,60" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M50,500 Q70,480 90,500 L70,520 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M700,520 Q720,500 740,520" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="150" cy="100" r="15" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Additional nature elements */}
                    <path d="M200,70 Q210,60 220,70 L210,80 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M190,80 Q200,75 210,80" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="600" cy="120" r="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M585,120 L615,120 M600,105 L600,135" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M150,530 Q160,520 170,530 L160,545 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M620,530 L630,520 L640,530 L650,520" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
                {projectId === '5' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Work 5 theme - generic creative sketches */}
                    <circle cx="70" cy="70" r="22" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M50,100 L90,100" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M700,80 Q720,70 740,80 Q760,90 780,80" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="150" y="60" width="35" height="30" rx="4" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M160,75 L175,75" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <ellipse cx="620" cy="130" rx="28" ry="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M80,520 Q100,510 120,520 T160,520" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="700" cy="530" r="20" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M690,530 L710,530 M700,520 L700,540" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M220,80 L240,60 L260,80 L240,100 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M200,530 L220,515 L240,530" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="580" cy="540" r="15" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                )}
                {projectId === '6' && (
                  <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Work 6 theme - generic creative sketches */}
                    <path d="M60,60 Q70,50 80,60 Q90,70 100,60" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="150" cy="80" r="18" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <rect x="700" y="60" width="38" height="35" rx="5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M710,77 L728,77" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
                    <ellipse cx="220" cy="90" rx="30" ry="18" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M600,120 L620,100 L640,120 L620,140 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M60,510 Q80,500 100,510 Q120,520 140,510" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="180" cy="530" r="19" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M680,530 L700,515 L720,530 L700,545 Z" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M620,545 Q630,535 640,545" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="240" y="520" width="32" height="28" rx="4" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <circle cx="580" cy="110" r="16" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
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
