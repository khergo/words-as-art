import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-shoelaces.jpg";

const Hero = () => {
  const scrollToWork = () => {
    const workSection = document.getElementById("work-preview");
    workSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl mb-6 animate-fade-in tracking-tight leading-tight">
            Words that make brands{" "}
            <span className="text-accent">impossible to ignore.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in-delay font-light max-w-3xl mx-auto">
            Creative strategist & copywriter crafting ideas that win hearts — and
            awards.
          </p>

          <button
            onClick={scrollToWork}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-medium transition-all hover:scale-105 animate-slide-up"
          >
            My Work
            <ArrowDown
              size={20}
              className="transition-transform group-hover:translate-y-1"
            />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown size={24} className="text-muted-foreground" />
      </div>
    </section>
  );
};

export default Hero;
