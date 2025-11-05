import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import iconLightbulb from "@/assets/icon-lightbulb.png";
import iconRocket from "@/assets/icon-rocket.png";
import iconStar from "@/assets/icon-star.png";
import iconPencil from "@/assets/icon-pencil.png";
import iconHeart from "@/assets/icon-heart.png";
import iconMegaphone from "@/assets/icon-megaphone.png";

const ProjectDetail = () => {
  const { projectId } = useParams();

  const projects = [
    {
      id: 1,
      title: "Nike Air Rebellion",
      category: "Campaign Strategy",
      description: "Redefining street culture through bold storytelling",
      year: "2024",
      icon: iconLightbulb,
      fullDescription: "A comprehensive campaign that redefined how Nike connects with urban youth culture. Through authentic storytelling and community engagement, we created a movement that resonated across social platforms.",
    },
    {
      id: 2,
      title: "Spotify Mood Waves",
      category: "Brand Voice",
      description: "Emotional connection through music narratives",
      year: "2023",
      icon: iconRocket,
      fullDescription: "Developed a brand voice strategy that transformed how Spotify communicates with listeners. By focusing on emotional connections and personal music journeys, we deepened user engagement.",
    },
    {
      id: 3,
      title: "Patagonia Wild Souls",
      category: "Environmental Campaign",
      description: "Stories that inspire action for the planet",
      year: "2023",
      icon: iconStar,
      fullDescription: "An environmental campaign that inspired thousands to take action. Through powerful storytelling and grassroots engagement, we amplified Patagonia's mission to protect our planet.",
    },
    {
      id: 4,
      title: "Airbnb Local Legends",
      category: "Content Strategy",
      description: "Celebrating hidden gems and local hosts",
      year: "2024",
      icon: iconPencil,
      fullDescription: "A content strategy that highlighted the unique stories of Airbnb hosts around the world. We celebrated local culture and created authentic connections between travelers and communities.",
    },
    {
      id: 5,
      title: "Apple Vision Dreams",
      category: "Product Launch",
      description: "Future of spatial computing, human-first",
      year: "2024",
      icon: iconHeart,
      fullDescription: "Led the product launch narrative for Apple's revolutionary spatial computing device. We focused on human-centered stories that made futuristic technology feel accessible and inspiring.",
    },
    {
      id: 6,
      title: "Levi's Worn Stories",
      category: "Brand Heritage",
      description: "Every thread tells a story worth keeping",
      year: "2023",
      icon: iconMegaphone,
      fullDescription: "Celebrated Levi's rich heritage through personal stories of beloved worn denim. Each piece became a chapter in a larger narrative about sustainability, memory, and timeless style.",
    },
  ];

  const project = projects.find((p) => p.id === Number(projectId));

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
            <Link
              to="/work"
              className="inline-flex items-center gap-2 text-lg font-handwritten text-[#666] hover:text-[#1a1a1a] transition-colors mb-8 group"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              Back to Work
            </Link>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-8">
                <img
                  src={project.icon}
                  alt={project.title}
                  className="w-48 h-48 object-contain mix-blend-multiply opacity-80"
                />
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <p className="text-sm font-handwritten font-medium text-[#dc3545] uppercase tracking-wider">
                  {project.category}
                </p>
                <span className="text-sm font-handwritten text-[#666]">•</span>
                <p className="text-sm font-handwritten text-[#666]">
                  {project.year}
                </p>
              </div>

              <h1 className="font-handwritten text-5xl md:text-7xl font-bold mb-6 text-[#1a1a1a] transform -rotate-1">
                {project.title}
              </h1>

              <p className="text-xl font-handwritten text-[#666] mb-8 transform rotate-1">
                {project.description}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 mb-8 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <h2 className="font-handwritten text-3xl font-bold mb-4 text-[#1a1a1a]">
                About This Project
              </h2>
              <p className="font-handwritten text-lg text-[#333] leading-relaxed">
                {project.fullDescription}
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 mb-8 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <h2 className="font-handwritten text-3xl font-bold mb-6 text-[#1a1a1a]">
                Project Media
              </h2>
              <div className="border-2 border-dashed border-[#666] rounded-lg p-12 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-[#666]" />
                <p className="font-handwritten text-lg text-[#666] mb-4">
                  Upload photos and videos for this project
                </p>
                <Button 
                  variant="outline" 
                  className="font-handwritten border-2 border-[#1a1a1a] bg-white hover:bg-[#dc3545] hover:text-white hover:border-[#dc3545] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  Choose Files
                </Button>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <h2 className="font-handwritten text-3xl font-bold mb-6 text-[#1a1a1a]">
                Additional Notes
              </h2>
              <textarea
                className="w-full min-h-[200px] p-4 font-handwritten text-lg border-2 border-[#666] rounded-lg bg-white/80 focus:outline-none focus:border-[#dc3545] transition-colors resize-none"
                placeholder="Add your project notes, insights, or additional details here..."
              />
              <Button 
                className="mt-4 font-handwritten bg-[#dc3545] hover:bg-[#c82333] text-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
