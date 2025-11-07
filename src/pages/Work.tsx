import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EditableText } from "@/components/EditableText";
import { EditableImage } from "@/components/EditableImage";
import { useEdit } from "@/contexts/EditContext";

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  year: string;
  icon_url: string;
}

const Work = () => {
  const { editMode } = useEdit();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id');

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const updateProject = async (projectId: number, field: string, value: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ [field]: value })
      .eq('id', projectId);

    if (!error) {
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, [field]: value } : p
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <p className="font-handwritten text-xl">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-24 relative z-10">
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto pl-6">
              <h1 className="font-handwritten text-6xl md:text-8xl font-bold mb-6 animate-fade-in text-[#1a1a1a] transform -rotate-2">
                Selected Work
              </h1>
              <p className="text-2xl font-handwritten text-[#333] max-w-2xl animate-fade-in-delay transform rotate-1">
                A collection of campaigns, brand stories, and ideas that made
                people stop, think, and feel something.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto pl-6">
              <div className="grid md:grid-cols-2 gap-12">
                {projects.map((project, index) => (
                  <Link
                    key={project.id}
                    to={`/work/${project.id}`}
                    className="group cursor-pointer text-center block"
                    style={{
                      animation: `fade-in 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="aspect-[16/10] mb-6 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <EditableImage
                        src={project.icon_url}
                        alt={project.title}
                        onSave={(url) => updateProject(project.id, 'icon_url', url)}
                        className="w-40 h-40 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                        folder={`project-${project.id}`}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center gap-3">
                        <EditableText
                          value={project.category}
                          onSave={(value) => updateProject(project.id, 'category', value)}
                          className="text-sm font-handwritten font-medium text-[#dc3545] uppercase tracking-wider"
                          as="p"
                        />
                        <span className="text-sm font-handwritten text-[#666]">•</span>
                        <EditableText
                          value={project.year}
                          onSave={(value) => updateProject(project.id, 'year', value)}
                          className="text-sm font-handwritten text-[#666]"
                          as="p"
                        />
                      </div>
                      <EditableText
                        value={project.title}
                        onSave={(value) => updateProject(project.id, 'title', value)}
                        className="font-handwritten text-4xl font-semibold text-[#1a1a1a] group-hover:text-[#dc3545] transition-colors"
                        as="h3"
                      />
                      <EditableText
                        value={project.description}
                        onSave={(value) => updateProject(project.id, 'description', value)}
                        className="text-lg font-handwritten text-[#666]"
                        as="p"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Work;
