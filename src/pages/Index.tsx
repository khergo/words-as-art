import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WorkPreview from "@/components/WorkPreview";
import Footer from "@/components/Footer";
import ShoelaceDecor from "@/components/ShoelaceDecor";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <WorkPreview />
      <Footer />
      <ShoelaceDecor />
    </div>
  );
};

export default Index;
