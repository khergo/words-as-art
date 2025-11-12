import { Mail, Linkedin, Instagram, Facebook } from "lucide-react";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-[#1a1a1a] text-white py-12 relative z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto pl-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="font-handwritten text-4xl font-bold mb-2 transform -rotate-2">
                Giorgi Khergiani
              </h3>
              <p className="text-lg font-handwritten opacity-80 transform rotate-1">Copywriter, Entrepreneur & Senior Beer Specialist</p>
            </div>

            <div className="flex items-center gap-6">
              <a href="mailto:giorgikhergiani@gmail.com" className="hover:text-[#dc3545] transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="https://www.linkedin.com/in/giorgikhergiani/" target="_blank" rel="noopener noreferrer" className="hover:text-[#dc3545] transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://www.instagram.com/thatglitchinthematrix/" target="_blank" rel="noopener noreferrer" className="hover:text-[#dc3545] transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/seduceyoutwice" target="_blank" rel="noopener noreferrer" className="hover:text-[#dc3545] transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20 text-center text-lg font-handwritten opacity-60 transform rotate-1">
            © {currentYear} Giorgi Khergiani. All rights reserved.
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;