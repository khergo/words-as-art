import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const WorkPreview = () => {
  const featuredProjects = [
    {
      id: 1,
      title: "Nike Air Rebellion",
      category: "Campaign Strategy",
      description: "Redefining street culture through bold storytelling",
    },
    {
      id: 2,
      title: "Spotify Mood Waves",
      category: "Brand Voice",
      description: "Emotional connection through music narratives",
    },
    {
      id: 3,
      title: "Patagonia Wild Souls",
      category: "Environmental Campaign",
      description: "Stories that inspire action for the planet",
    },
  ];

  return (
    <section id="work-preview" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto pl-6">
          <div className="flex items-end justify-between mb-16">
            <h2 className="font-handwritten text-5xl md:text-6xl font-bold text-[#1a1a1a] transform -rotate-1">
              Selected Work
            </h2>
            <Link
              to="/work"
              className="hidden md:flex items-center gap-2 text-lg font-handwritten font-medium text-[#666] hover:text-[#1a1a1a] transition-colors group transform rotate-1"
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
              <div
                key={project.id}
                className="group cursor-pointer"
                style={{
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="aspect-[4/5] bg-[#e8c5a0]/30 mb-4 transition-transform group-hover:scale-[1.02] border-2 border-[#d4a574]" />
                <p className="text-sm font-handwritten font-medium text-[#dc3545] mb-2 uppercase tracking-wider transform -rotate-1">
                  {project.category}
                </p>
                <h3 className="font-handwritten text-3xl font-semibold mb-2 text-[#1a1a1a] group-hover:text-[#dc3545] transition-colors transform rotate-1">
                  {project.title}
                </h3>
                <p className="text-base font-handwritten text-[#666] transform -rotate-1">
                  {project.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/work"
            className="md:hidden flex items-center justify-center gap-2 text-lg font-handwritten font-medium text-[#666] hover:text-[#1a1a1a] transition-colors group mt-12 transform rotate-1"
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
