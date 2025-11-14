import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WorkPreview from "@/components/WorkPreview";
import Footer from "@/components/Footer";
import doodleScribble from "@/assets/doodle-scribble.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navigation />
      <Hero />
      <WorkPreview />
      <Footer />
      <div className="absolute bottom-8 right-8 w-64 h-64 opacity-10 pointer-events-none z-0">
        <img
          src={doodleScribble}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default Index;
