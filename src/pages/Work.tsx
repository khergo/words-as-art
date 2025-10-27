import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Work = () => {
  const projects = [
    {
      id: 1,
      title: "Nike Air Rebellion",
      category: "Campaign Strategy",
      description: "Redefining street culture through bold storytelling",
      year: "2024",
    },
    {
      id: 2,
      title: "Spotify Mood Waves",
      category: "Brand Voice",
      description: "Emotional connection through music narratives",
      year: "2023",
    },
    {
      id: 3,
      title: "Patagonia Wild Souls",
      category: "Environmental Campaign",
      description: "Stories that inspire action for the planet",
      year: "2023",
    },
    {
      id: 4,
      title: "Airbnb Local Legends",
      category: "Content Strategy",
      description: "Celebrating hidden gems and local hosts",
      year: "2024",
    },
    {
      id: 5,
      title: "Apple Vision Dreams",
      category: "Product Launch",
      description: "Future of spatial computing, human-first",
      year: "2024",
    },
    {
      id: 6,
      title: "Levi's Worn Stories",
      category: "Brand Heritage",
      description: "Every thread tells a story worth keeping",
      year: "2023",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24">
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                Selected Work
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl animate-fade-in-delay">
                A collection of campaigns, brand stories, and ideas that made
                people stop, think, and feel something.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group cursor-pointer"
                    style={{
                      animation: `fade-in 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="aspect-[16/10] bg-muted mb-6 transition-transform group-hover:scale-[1.02]" />
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-accent uppercase tracking-wider">
                        {project.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.year}
                      </p>
                    </div>
                    <h3 className="font-serif text-3xl font-semibold mb-3 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
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
