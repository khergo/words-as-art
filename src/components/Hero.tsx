import { ArrowDown } from "lucide-react";
import handwritingHero from "@/assets/handwriting-hero.png";

const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f6f6f6]">
      {/* Notebook paper texture and lines */}
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: `
          linear-gradient(transparent 0px, transparent 39px, #d4a574 39px, #d4a574 40px),
          linear-gradient(90deg, #e8c5a0 1px, transparent 1px)
        `,
      backgroundSize: '100% 40px, 40px 100%',
      backgroundPosition: '0 0, 80px 0'
    }} />

      {/* Red vertical margin line */}
      <div className="absolute left-[40px] md:left-[80px] top-0 bottom-0 w-[2px] bg-[#dc3545] opacity-60" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-left pl-8 md:pl-12">
          <a href="https://www.nairnairi.ge/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
            <img 
              src={handwritingHero} 
              alt="The copywriter selling dope shoelaces to buy a beer" 
              className="w-full max-w-3xl animate-fade-in"
            />
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 right-12 animate-bounce transform rotate-12">
        <ArrowDown size={24} className="text-[#666]" />
      </div>
    </section>;
};
export default Hero;