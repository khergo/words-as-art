import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import scribbleDecor from "@/assets/scribble-decor.png";

const Hero = () => {
  const [scribblePos, setScribblePos] = useState({ x: 0, y: 0 });
  const scribbleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!scribbleRef.current || !containerRef.current) return;

      const scribbleRect = scribbleRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const scribbleCenterX = scribbleRect.left + scribbleRect.width / 2;
      const scribbleCenterY = scribbleRect.top + scribbleRect.height / 2;
      
      const distanceX = e.clientX - scribbleCenterX;
      const distanceY = e.clientY - scribbleCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      const threshold = 150;
      
      if (distance < threshold) {
        const angle = Math.atan2(distanceY, distanceX);
        const force = (threshold - distance) / threshold;
        const moveDistance = force * 80;
        
        let newX = scribblePos.x - Math.cos(angle) * moveDistance;
        let newY = scribblePos.y - Math.sin(angle) * moveDistance;
        
        const maxX = containerRect.width - scribbleRect.width - 32;
        const maxY = containerRect.height - scribbleRect.height - 32;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        setScribblePos({ x: newX, y: newY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [scribblePos]);

  return <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f6f6f6]">
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

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-left pl-4 sm:pl-6 md:pl-8 lg:pl-12">
          <div className="font-handwritten animate-fade-in text-[#1a1a1a]">
            {/* Crossed out "the" at the top */}
            <div className="relative inline-block mb-2 ml-2 sm:ml-4">
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl opacity-70 relative">
                the
                <svg className="absolute top-1/2 left-0 w-full" height="3" viewBox="0 0 100 3" preserveAspectRatio="none">
                  <path d="M0,1.5 L100,1.5" stroke="#1a1a1a" strokeWidth="2" />
                </svg>
              </span>
            </div>

            {/* Main handwritten text */}
            <div className="space-y-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-relaxed">
              <div className="transform -rotate-1 ml-2">
                The <a href="https://giorgi.rocks/work/5" target="_blank" rel="noopener noreferrer" className="relative inline-block hover:opacity-80 transition-opacity">
                  shoelace dealer
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                    <path d="M0,5 Q10,2 20,5 Q30,8 40,5 Q50,2 60,5 Q70,8 80,5 Q90,2 100,5 Q110,8 120,5 Q130,2 140,5 Q150,8 160,5 Q170,2 180,5 Q190,8 200,5" stroke="#dc3545" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
              <div className="transform rotate-0.5 ml-6">
                selling <span className="ml-3">copywriting</span>
              </div>
              <div className="transform -rotate-0.5 ml-4">
                to <span className="ml-3">buy</span> <span className="ml-3">a</span> <span className="ml-3">beer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scribble decoration in top right - hidden on mobile */}
      <div 
        ref={scribbleRef}
        className="hidden md:block absolute w-48 md:w-56 opacity-60 pointer-events-none transition-all duration-700 ease-out"
        style={{
          top: `${80 + scribblePos.y}px`,
          right: `${96 + scribblePos.x}px`,
        }}
      >
        <img 
          src={scribbleDecor} 
          alt="" 
          className="w-full h-auto mix-blend-multiply"
        />
      </div>

      <div className="absolute bottom-8 right-8 md:right-12 animate-bounce transform rotate-12">
        <ArrowDown size={24} className="text-[#666]" />
      </div>
    </section>;
};
export default Hero;