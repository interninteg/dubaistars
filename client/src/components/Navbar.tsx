import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Define navigation items based on authentication status
  const getNavItems = () => {
    const commonItems = [
      { path: "/ai-advisor", label: "AI Advisor" }
    ];
    
    // Add these items only for authenticated users
    const authItems = [
      { path: "/", label: "Dashboard" },
      { path: "/book", label: "Book a Trip" },
      { path: "/packages", label: "Packages" },
      { path: "/accommodations", label: "Accommodations" },
    ];
    
    return isAuthenticated ? [...authItems, ...commonItems] : commonItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-black/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href={isAuthenticated ? "/" : "/ai-advisor"}>
                <span className="cursor-pointer text-amber-400 text-2xl font-['Orbitron'] font-bold">
                  Dubai<span className="text-slate-50">to the</span><span className="text-purple-700">Stars</span>
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === item.path
                    ? "text-amber-400"
                    : "text-slate-50 hover:text-amber-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-slate-50 text-sm hidden sm:inline-block">
                    {user?.username}
                  </span>
                </div>
                <Button 
                  onClick={() => logout()} 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-50 hover:text-amber-400"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline-block">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="text-amber-400 border-amber-400 hover:bg-amber-400/10">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-amber-400 text-black hover:bg-amber-500"
                    onClick={() => {
                      // This will open the auth page on the registration tab
                      localStorage.setItem('authTab', 'register');
                    }}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
            <div className="ml-3 md:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-50 hover:text-amber-400 focus:outline-none"
              >
                <i className="ri-menu-line text-2xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? "" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90 backdrop-blur-md">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                location === item.path
                  ? "text-amber-400"
                  : "text-slate-50 hover:text-amber-400"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {!isAuthenticated && (
            <div className="flex flex-col space-y-2 mt-4 px-3">
              <Link href="/auth">
                <Button variant="outline" className="w-full text-amber-400 border-amber-400 hover:bg-amber-400/10">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button 
                  variant="default" 
                  className="w-full bg-amber-400 text-black hover:bg-amber-500"
                  onClick={() => {
                    localStorage.setItem('authTab', 'register');
                  }}
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
