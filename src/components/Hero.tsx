import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToWork = () => {
    const workSection = document.getElementById("work-preview");
    workSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f5e6d3]">
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

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-left pl-12">
          <h1 className="font-handwritten font-bold text-5xl md:text-7xl lg:text-8xl mb-6 animate-fade-in leading-relaxed text-[#1a1a1a] transform -rotate-1">
            Words that make brands{" "}
            <span className="text-[#dc3545] inline-block transform rotate-2 relative">
              impossible to ignore.
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,4 Q25,0 50,4 T100,4" stroke="#dc3545" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="font-handwritten text-2xl md:text-3xl text-[#333] mb-12 animate-fade-in-delay max-w-3xl transform rotate-1 leading-relaxed">
            Creative strategist & copywriter crafting ideas that win hearts — and
            awards.
          </p>

          <button
            onClick={scrollToWork}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#dc3545] text-white font-handwritten text-xl font-medium transition-all hover:scale-105 animate-slide-up transform -rotate-1 shadow-lg hover:shadow-xl"
          >
            My Work
            <ArrowDown
              size={20}
              className="transition-transform group-hover:translate-y-1"
            />
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 right-12 animate-bounce transform rotate-12">
        <ArrowDown size={24} className="text-[#666]" />
      </div>
    </section>
  );
};

export default Hero;
