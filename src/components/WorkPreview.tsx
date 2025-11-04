import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import iconLightbulb from "@/assets/icon-lightbulb.png";
import iconRocket from "@/assets/icon-rocket.png";
import iconStar from "@/assets/icon-star.png";

const WorkPreview = () => {
  const featuredProjects = [
    {
      id: 1,
      title: "Nike Air Rebellion",
      category: "Campaign Strategy",
      description: "Redefining street culture through bold storytelling",
      icon: iconLightbulb,
    },
    {
      id: 2,
      title: "Spotify Mood Waves",
      category: "Brand Voice",
      description: "Emotional connection through music narratives",
      icon: iconRocket,
    },
    {
      id: 3,
      title: "Patagonia Wild Souls",
      category: "Environmental Campaign",
      description: "Stories that inspire action for the planet",
      icon: iconStar,
    },
  ];

  return (
    <section id="work-preview" className="py-24 relative bg-[#f5e6d3] overflow-hidden">
      {/* Notebook paper texture and lines */}
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
              <Link
                key={project.id}
                to="/work"
                className="group cursor-pointer block"
                style={{
                  animation: `fade-in 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="aspect-square mb-4 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
                  <img 
                    src={project.icon} 
                    alt={project.title}
                    className="w-32 h-32 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-sm font-handwritten font-medium text-[#dc3545] mb-2 uppercase tracking-wider transform -rotate-1">
                  {project.category}
                </p>
                <h3 className="font-handwritten text-3xl font-semibold mb-2 text-[#1a1a1a] group-hover:text-[#dc3545] transition-colors transform rotate-1">
                  {project.title}
                </h3>
                <p className="text-base font-handwritten text-[#666] transform -rotate-1">
                  {project.description}
                </p>
              </Link>
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
