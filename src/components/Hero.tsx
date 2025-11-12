import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
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
          <h1 className="font-handwritten font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-12 animate-fade-in leading-relaxed text-[#1a1a1a]">
            <span className="block transform -rotate-1 relative mb-4">
              The copywriter
            </span>
            <span className="block text-[#1a1a1a] transform rotate-1 relative">
              selling dope{" "}
              <a href="https://www.nairnairi.ge/" target="_blank" rel="noopener noreferrer" className="relative inline-block hover:opacity-80 transition-opacity">
                shoelaces
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0,5 Q10,2 20,5 Q30,8 40,5 Q50,2 60,5 Q70,8 80,5 Q90,2 100,5 Q110,8 120,5 Q130,2 140,5 Q150,8 160,5 Q170,2 180,5 Q190,8 200,5" stroke="#dc3545" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <br />
              to buy a beer.
              
            </span>
          </h1>

          <Link to="/work" className="inline-block px-8 py-4 bg-[#dc3545] text-white font-handwritten text-2xl font-medium transition-all hover:scale-105 animate-slide-up transform -rotate-1 shadow-lg hover:shadow-xl">
            My Work
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 right-12 animate-bounce transform rotate-12">
        <ArrowDown size={24} className="text-[#666]" />
      </div>
    </section>;
};
export default Hero;