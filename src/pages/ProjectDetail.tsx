import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditableText } from "@/components/EditableText";
import { EditableImage } from "@/components/EditableImage";
import { useEdit } from "@/contexts/EditContext";

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
  const { toast } = useToast();
  const { editMode } = useEdit();
  const [project, setProject] = useState<Project | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load project data
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
      }
    };

    loadProject();
  }, [projectId]);

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
  const saveProjectMedia = async () => {
    if (!projectId) return;

    const { data: existing } = await supabase
      .from('project_media')
      .select('id')
      .eq('project_id', Number(projectId))
      .maybeSingle();

    const mediaData = {
      project_id: Number(projectId),
      video_url: videoUrl,
      photo_urls: photoUrls,
      notes: notes,
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
        description: "Could not save project media. Please try again.",
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

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('project-photos')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: `Could not upload ${file.name}`,
          variant: "destructive",
        });
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('project-photos')
          .getPublicUrl(fileName);
        newPhotoUrls.push(publicUrl);
      }
    }

    if (newPhotoUrls.length > 0) {
      setPhotoUrls([...photoUrls, ...newPhotoUrls]);
      setTimeout(saveProjectMedia, 100);
    }
    setUploading(false);
  };

  // Remove photo
  const removePhoto = async (url: string) => {
    setPhotoUrls(photoUrls.filter(p => p !== url));
    setTimeout(saveProjectMedia, 100);
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
              <h1 className="font-handwritten text-4xl font-bold mb-4 text-[#1a1a1a]">
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
    <div className="min-h-screen relative bg-[#f5e6d3]">
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
          <div className="max-w-4xl mx-auto pl-6">
            <div className="mb-8">
              <Link
                to="/work"
                className="inline-flex items-center gap-2 text-lg font-handwritten text-[#666] hover:text-[#1a1a1a] transition-colors group"
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
                  className="w-48 h-48 object-contain mix-blend-multiply opacity-80"
                  folder={`project-${projectId}`}
                />
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <EditableText
                  value={project.category}
                  onSave={(value) => updateProject('category', value)}
                  className="text-sm font-handwritten font-medium text-[#dc3545] uppercase tracking-wider"
                  as="p"
                />
                <span className="text-sm font-handwritten text-[#666]">•</span>
                <EditableText
                  value={project.year}
                  onSave={(value) => updateProject('year', value)}
                  className="text-sm font-handwritten text-[#666]"
                  as="p"
                />
              </div>

              <EditableText
                value={project.title}
                onSave={(value) => updateProject('title', value)}
                className="font-handwritten text-5xl md:text-7xl font-bold mb-6 text-[#1a1a1a] transform -rotate-1"
                as="h1"
              />

              <EditableText
                value={project.description}
                onSave={(value) => updateProject('description', value)}
                className="text-xl font-handwritten text-[#666] mb-8 transform rotate-1"
                as="p"
              />
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 mb-8 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <h2 className="font-handwritten text-3xl font-bold mb-4 text-[#1a1a1a]">
                About This Project
              </h2>
              <EditableText
                value={project.full_description}
                onSave={(value) => updateProject('full_description', value)}
                className="font-handwritten text-lg text-[#333] leading-relaxed"
                as="p"
                multiline
              />
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 mb-8 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <h2 className="font-handwritten text-3xl font-bold mb-6 text-[#1a1a1a]">
                Project Media
              </h2>
              
              {/* Video Editor Section - Only visible in edit mode */}
              {editMode && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <label className="font-handwritten text-lg font-medium text-[#1a1a1a] mb-2 block">
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
              )}

              {/* Embedded Video Display - Always visible if exists */}
              {embedUrl && (
                <div className="mb-6">
                  <div className="relative w-full pt-[56.25%] border-2 border-[#1a1a1a] rounded-lg overflow-hidden">
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Project video"
                    />
                  </div>
                </div>
              )}

              {/* Photo Upload Section - Only visible in edit mode */}
              {editMode && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <label className="font-handwritten text-lg font-medium text-[#1a1a1a] mb-2 block">
                    Upload Photos
                  </label>
                  <div className="border-2 border-dashed border-[#666] rounded-lg p-8 text-center bg-white">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-[#666]" />
                    <p className="font-handwritten text-base text-[#666] mb-3">
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
              )}

              {/* Uploaded Photos Display - Always visible if exists */}
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Project photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border-2 border-[#1a1a1a]"
                      />
                      {editMode && (
                        <button
                          onClick={() => removePhoto(url)}
                          className="absolute top-2 right-2 bg-[#dc3545] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!editMode && !embedUrl && photoUrls.length === 0 && (
                <p className="font-handwritten text-lg text-[#666] text-center py-8">
                  No media available for this project yet.
                </p>
              )}
            </div>

            {editMode && (
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                <h2 className="font-handwritten text-3xl font-bold mb-6 text-[#1a1a1a]">
                  Additional Notes (Editor Only)
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[200px] p-4 font-handwritten text-lg border-2 border-[#666] rounded-lg bg-white/80 focus:outline-none focus:border-[#dc3545] transition-colors resize-none"
                  placeholder="Add your project notes, insights, or additional details here..."
                />
                <Button
                  onClick={saveProjectMedia}
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
