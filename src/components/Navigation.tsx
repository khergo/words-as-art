import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { EditModeToggle } from "./EditModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();

  const links = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f6f6f6]/90 backdrop-blur-md border-b-2 border-[#d4a574]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-handwritten font-bold tracking-tight text-[#1a1a1a] transform -rotate-2">
            GK
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-handwritten font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#dc3545] after:transition-transform hover:after:scale-x-100 ${
                  isActive(link.path)
                    ? "text-[#1a1a1a] after:scale-x-100"
                    : "text-[#666]"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <>
                <EditModeToggle />
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="font-handwritten border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#1a1a1a]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-base font-handwritten font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-[#1a1a1a]"
                    : "text-[#666]"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <div className="pt-3 space-y-3">
                <EditModeToggle />
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="w-full font-handwritten border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
