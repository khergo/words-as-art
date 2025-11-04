import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import iconLightbulb from "@/assets/icon-lightbulb.png";
import iconRocket from "@/assets/icon-rocket.png";
import iconStar from "@/assets/icon-star.png";
import iconPencil from "@/assets/icon-pencil.png";
import iconHeart from "@/assets/icon-heart.png";
import iconMegaphone from "@/assets/icon-megaphone.png";

const Work = () => {
  const projects = [
    {
      id: 1,
      title: "Nike Air Rebellion",
      category: "Campaign Strategy",
      description: "Redefining street culture through bold storytelling",
      year: "2024",
      icon: iconLightbulb,
    },
    {
      id: 2,
      title: "Spotify Mood Waves",
      category: "Brand Voice",
      description: "Emotional connection through music narratives",
      year: "2023",
      icon: iconRocket,
    },
    {
      id: 3,
      title: "Patagonia Wild Souls",
      category: "Environmental Campaign",
      description: "Stories that inspire action for the planet",
      year: "2023",
      icon: iconStar,
    },
    {
      id: 4,
      title: "Airbnb Local Legends",
      category: "Content Strategy",
      description: "Celebrating hidden gems and local hosts",
      year: "2024",
      icon: iconPencil,
    },
    {
      id: 5,
      title: "Apple Vision Dreams",
      category: "Product Launch",
      description: "Future of spatial computing, human-first",
      year: "2024",
      icon: iconHeart,
    },
    {
      id: 6,
      title: "Levi's Worn Stories",
      category: "Brand Heritage",
      description: "Every thread tells a story worth keeping",
      year: "2023",
      icon: iconMegaphone,
    },
  ];

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
                  <div
                    key={project.id}
                    className="group cursor-pointer text-center"
                    style={{
                      animation: `fade-in 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="aspect-[16/10] mb-6 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <img 
                        src={project.icon} 
                        alt={project.title}
                        className="w-40 h-40 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center gap-3">
                        <p className="text-sm font-handwritten font-medium text-[#dc3545] uppercase tracking-wider">
                          {project.category}
                        </p>
                        <span className="text-sm font-handwritten text-[#666]">•</span>
                        <p className="text-sm font-handwritten text-[#666]">
                          {project.year}
                        </p>
                      </div>
                      <h3 className="font-handwritten text-4xl font-semibold text-[#1a1a1a] group-hover:text-[#dc3545] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-lg font-handwritten text-[#666]">
                        {project.description}
                      </p>
                    </div>
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
