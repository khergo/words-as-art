import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import doodleBeer from "@/assets/doodle-beer.png";
import doodleShoelaces from "@/assets/doodle-shoelaces.png";
import doodleSneakers from "@/assets/doodle-sneakers.png";

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

      {/* Decorative scribbles */}
      <img 
        src={doodleBeer} 
        alt="" 
        className="absolute bottom-12 left-12 w-24 h-24 opacity-30 rotate-12 hidden md:block pointer-events-none"
      />
      <img 
        src={doodleShoelaces} 
        alt="" 
        className="absolute top-20 right-16 w-32 h-32 opacity-25 -rotate-6 hidden lg:block pointer-events-none"
      />
      <img 
        src={doodleSneakers} 
        alt="" 
        className="absolute top-1/3 left-20 w-28 h-28 opacity-20 rotate-[-15deg] hidden md:block pointer-events-none"
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-left pl-8 md:pl-12">
          <div className="font-handwritten animate-fade-in text-[#1a1a1a]">
            {/* Crossed out "the" at the top */}
            <div className="relative inline-block mb-2 ml-4">
              <span className="text-3xl md:text-5xl opacity-70 relative">
                the
                <svg className="absolute top-1/2 left-0 w-full" height="3" viewBox="0 0 100 3" preserveAspectRatio="none">
                  <path d="M0,1.5 L100,1.5" stroke="#1a1a1a" strokeWidth="2" />
                </svg>
              </span>
            </div>

            {/* Main handwritten text */}
            <div className="space-y-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-relaxed">
              <div className="transform -rotate-1 ml-2">
                The copywriter
              </div>
              <div className="transform rotate-0.5 ml-6">
                selling <span className="ml-3">dope</span> <span className="ml-3">
                  <a href="https://www.nairnairi.ge/" target="_blank" rel="noopener noreferrer" className="relative inline-block hover:opacity-80 transition-opacity">
                    shoelaces
                    <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                      <path d="M0,5 Q10,2 20,5 Q30,8 40,5 Q50,2 60,5 Q70,8 80,5 Q90,2 100,5 Q110,8 120,5 Q130,2 140,5 Q150,8 160,5 Q170,2 180,5 Q190,8 200,5" stroke="#dc3545" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </span>
              </div>
              <div className="transform -rotate-0.5 ml-4">
                to <span className="ml-3">buy</span> <span className="ml-3">a</span> <span className="ml-3">beer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-12 animate-bounce transform rotate-12">
        <ArrowDown size={24} className="text-[#666]" />
      </div>
    </section>;
};
export default Hero;