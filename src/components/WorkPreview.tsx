import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  icon_url: string;
}

const WorkPreview = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, category, description, icon_url')
      .order('id')
      .limit(3);

    if (!error && data) {
      setFeaturedProjects(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section id="work-preview" className="py-24 relative bg-[#f6f6f6] overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <p className="font-handwritten text-2xl">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="work-preview" className="py-24 relative bg-[#f6f6f6] overflow-hidden">
      {/* Notebook paper texture and lines */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(transparent 0px, transparent 39px, #d4a574 39px, #d4a574 40px),
          linear-gradient(90deg, #e8c5a0 1px, transparent 1px)
        `,
        backgroundSize: '100% 40px, 40px 100%',
        backgroundPosition: '0 0, 80px 0'
      }} />

      {/* Red vertical margin line */}
      <div className="absolute left-[80px] top-0 bottom-0 w-[2px] bg-[#dc3545] opacity-60" />

      {/* Light sketches and scratches - used notebook feel */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M200,100 Q250,90 300,100" stroke="#666" strokeWidth="1" fill="none" opacity="0.3"/>
          <circle cx="800" cy="150" r="20" stroke="#666" strokeWidth="1" fill="none" opacity="0.3"/>
          <path d="M400,300 L420,320" stroke="#666" strokeWidth="1" fill="none" opacity="0.3"/>
          <path d="M1000,200 Q1020,190 1040,200" stroke="#666" strokeWidth="1" fill="none" opacity="0.3"/>
          <path d="M150,500 L170,480" stroke="#666" strokeWidth="1" fill="none" opacity="0.3"/>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto pl-6">
          <div className="flex items-end justify-between mb-16">
            <h2 className="font-handwritten text-6xl md:text-7xl font-bold text-[#1a1a1a] transform -rotate-1">
              Selected Work
            </h2>
            <Link
              to="/work"
              className="hidden md:flex items-center gap-2 text-xl font-handwritten font-medium text-[#666] hover:text-[#1a1a1a] transition-colors group transform rotate-1"
            >
              View All Projects
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.id}
                to={`/work/${project.id}`}
                className="group cursor-pointer block text-center"
                style={{
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="aspect-square mb-6 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
                  <img 
                    src={project.icon_url} 
                    alt={project.title}
                    className="w-32 h-32 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-base font-handwritten font-medium text-[#dc3545] uppercase tracking-wider">
                    {project.category}
                  </p>
                  <h3 className="font-handwritten text-4xl font-semibold text-[#1a1a1a] group-hover:text-[#dc3545] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-lg font-handwritten text-[#666]">
                    {project.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/work"
            className="md:hidden flex items-center justify-center gap-2 text-xl font-handwritten font-medium text-[#666] hover:text-[#1a1a1a] transition-colors group mt-12 transform rotate-1"
          >
            View All Projects
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WorkPreview;
