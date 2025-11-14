import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WorkPreview from "@/components/WorkPreview";
import Footer from "@/components/Footer";
import scribbleDecor from "@/assets/scribble-decor.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navigation />
      <Hero />
      <WorkPreview />
      <Footer />
      <img
        src={scribbleDecor}
        alt=""
        className="fixed bottom-8 right-8 w-64 h-auto opacity-20 pointer-events-none z-10"
      />
    </div>
  );
};

export default Index;
