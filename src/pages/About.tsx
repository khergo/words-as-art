import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Award, Upload } from "lucide-react";
import cvDownloadIcon from "@/assets/cv-download-icon.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableText } from "@/components/EditableText";
import { EditableImage } from "@/components/EditableImage";
import { useEdit } from "@/contexts/EditContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const About = () => {
  const { editMode } = useEdit();
  const [cvUploading, setCVUploading] = useState(false);
  
  const { data: pageContent } = useQuery({
    queryKey: ['page-content', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'about');
      if (error) throw error;
      return data;
    },
  });

  const { data: awards } = useQuery({
    queryKey: ['awards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getContent = (sectionKey: string) => {
    return pageContent?.find(item => item.section_key === sectionKey)?.content_value || '';
  };

  const updateContent = async (sectionKey: string, value: string) => {
    const content = pageContent?.find(item => item.section_key === sectionKey);
    if (!content) return;

    const { error } = await supabase
      .from('page_content')
      .update({ content_value: value })
      .eq('id', content.id);
    
    if (error) throw error;
  };

  const updateAward = async (awardId: string, field: 'year' | 'title' | 'category', value: string) => {
    const { error } = await supabase
      .from('awards')
      .update({ [field]: value })
      .eq('id', awardId);
    
    if (error) throw error;
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10485760) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    setCVUploading(true);

    try {
      // Upload to Supabase storage
      const fileName = `cv/cv_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Update database
      await updateContent('cv_url', publicUrl);

      toast({
        title: "Success",
        description: "CV uploaded successfully!"
      });
    } catch (error) {
      console.error('CV upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload CV. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCVUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-24 relative z-10">
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto pl-6">
              <EditableText
                value={getContent('title')}
                onSave={(value) => updateContent('title', value)}
                as="h1"
                className="font-handwritten text-6xl md:text-8xl font-bold mb-8 animate-fade-in text-[#1a1a1a] transform -rotate-2"
              />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto pl-6">
              <div className="grid md:grid-cols-5 gap-12 mb-20">
                <div className="md:col-span-2">
                  <div className="relative inline-block w-full">
                    {/* Decorative pin */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-red-400 to-red-500"></div>
                        <div className="absolute inset-2 rounded-full bg-red-600 opacity-50"></div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-3 bg-gray-400"></div>
                    </div>
                    
                    {/* Sticker wrapper with rotation */}
                    <div className="relative transform rotate-2 transition-transform hover:rotate-0 hover:scale-105 duration-300">
                      {getContent('profile_image') ? (
                        <div className="relative">
                          <EditableImage
                            src={getContent('profile_image')}
                            alt="Profile photo or GIF"
                            onSave={(url) => updateContent('profile_image', url)}
                            className="w-full h-auto object-contain animate-fade-in border-2 border-[#d4a574] rounded-lg"
                            bucketName="project-photos"
                            folder="about"
                          />
                        </div>
                      ) : (
                        <div 
                          className={`aspect-[3/4] bg-[#e8c5a0]/30 animate-fade-in border-2 border-[#d4a574] rounded-lg flex items-center justify-center ${editMode ? 'cursor-pointer hover:bg-[#e8c5a0]/50' : ''}`}
                          onClick={() => editMode && document.getElementById('profile-upload')?.click()}
                        >
                          {editMode && (
                            <>
                              <span className="font-handwritten text-lg text-[#666]">Click to upload image or GIF</span>
                              <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `about/${Date.now()}_${Math.random()}.${fileExt}`;
                                  
                                  const { error: uploadError } = await supabase.storage
                                    .from('project-photos')
                                    .upload(fileName, file);
                                  
                                  if (uploadError) throw uploadError;
                                  
                                  const { data: { publicUrl } } = supabase.storage
                                    .from('project-photos')
                                    .getPublicUrl(fileName);
                                  
                                  await updateContent('profile_image', publicUrl);
                                }}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-6 animate-fade-in-delay">
                  <EditableText
                    value={getContent('intro')}
                    onSave={(value) => updateContent('intro', value)}
                    as="p"
                    className="text-2xl font-handwritten leading-relaxed text-[#1a1a1a] transform -rotate-1 whitespace-pre-line"
                    multiline
                  />

                  <EditableText
                    value={getContent('paragraph_1')}
                    onSave={(value) => updateContent('paragraph_1', value)}
                    as="p"
                    className="text-2xl font-handwritten leading-relaxed text-[#1a1a1a] transform rotate-1 whitespace-pre-line"
                    multiline
                  />

                  <EditableText
                    value={getContent('paragraph_2')}
                    onSave={(value) => updateContent('paragraph_2', value)}
                    as="p"
                    className="text-2xl font-handwritten leading-relaxed text-[#1a1a1a] transform -rotate-1 whitespace-pre-line"
                    multiline
                  />

                  <EditableText
                    value={getContent('paragraph_3')}
                    onSave={(value) => updateContent('paragraph_3', value)}
                    as="p"
                    className="text-2xl font-handwritten leading-relaxed text-[#1a1a1a] transform rotate-1 whitespace-pre-line"
                    multiline
                  />
                </div>
              </div>

              <div className="mt-12 mb-16 flex justify-center animate-fade-in">
                <div className="flex gap-3 items-center">
                  {getContent('cv_url') ? (
                    <button 
                      onClick={() => window.open(getContent('cv_url'), '_blank')}
                      className="transition-all transform hover:scale-105"
                    >
                      <img 
                        src={cvDownloadIcon} 
                        alt="Download CV" 
                        className="w-48 h-48 object-contain"
                      />
                    </button>
                  ) : (
                    !editMode && (
                      <p className="text-[#666] font-handwritten text-lg">No CV available</p>
                    )
                  )}
                  
                  {editMode && (
                    <>
                      <Button
                        onClick={() => document.getElementById('cv-upload')?.click()}
                        disabled={cvUploading}
                        className="bg-[#28a745] hover:bg-[#218838] text-white font-handwritten text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
                      >
                        <Upload className="mr-2" size={20} />
                        {cvUploading ? 'Uploading...' : getContent('cv_url') ? 'Replace CV' : 'Upload CV'}
                      </Button>
                      <input
                        id="cv-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleCVUpload}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="border-t-2 border-[#d4a574] pt-16 animate-slide-up">
                <div className="flex items-center gap-3 mb-12">
                  <Award className="text-[#dc3545]" size={32} />
                  <EditableText
                    value={getContent('awards_title')}
                    onSave={(value) => updateContent('awards_title', value)}
                    as="h2"
                    className="font-handwritten text-5xl font-bold text-[#1a1a1a] transform -rotate-1"
                  />
                </div>

                <div className="space-y-6">
                  {awards?.map((award) => (
                    <div
                      key={award.id}
                      className="flex items-start gap-6 pb-6 border-b-2 border-[#d4a574] last:border-0"
                    >
                      <EditableText
                        value={award.year}
                        onSave={(value) => updateAward(award.id, 'year', value)}
                        as="span"
                        className="text-xl font-handwritten font-medium text-[#dc3545] min-w-[70px] transform rotate-1"
                      />
                      <div className="flex-1">
                        <EditableText
                          value={award.title}
                          onSave={(value) => updateAward(award.id, 'title', value)}
                          as="h3"
                          className="text-3xl font-handwritten font-semibold mb-1 text-[#1a1a1a] transform -rotate-1"
                        />
                        <EditableText
                          value={award.category}
                          onSave={(value) => updateAward(award.id, 'category', value)}
                          as="p"
                          className="text-xl font-handwritten text-[#666] transform rotate-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
