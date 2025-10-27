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
    <section id="work-preview" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">
              Selected Work
            </h2>
            <Link
              to="/work"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
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
                <div className="aspect-[4/5] bg-muted mb-4 transition-transform group-hover:scale-[1.02]" />
                <p className="text-xs font-medium text-accent mb-2 uppercase tracking-wider">
                  {project.category}
                </p>
                <h3 className="font-serif text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/work"
            className="md:hidden flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group mt-12"
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
