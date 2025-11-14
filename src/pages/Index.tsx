import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WorkPreview from "@/components/WorkPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <WorkPreview />
      <Footer />
    </div>
  );
};

export default Index;
