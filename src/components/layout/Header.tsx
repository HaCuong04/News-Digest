import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Bell, User as UserIcon, LogOut, Settings } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/lib/AuthContext";

const categories = [
  "Technology",
  "Health",
  "Construction",
  "Consumer",
  "Manufacturing",
  "Retail",
  "Science",
  "Professional Services",
  "Travel"
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const location = useLocation();
  const { user, signInWithGoogle, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200 py-2 shadow-sm" : "bg-white py-[15px]"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-black tracking-tighter text-violet-600">
              NEWS<span className="text-gray-900 font-light italic">DIGEST</span>
            </Link>
            <nav className="hidden xl:flex items-center gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/?category=${cat}`}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-violet-600 whitespace-nowrap",
                    location.search.includes(`category=${cat}`) ? "text-violet-600" : "text-gray-600"
                  )}
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-violet-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-violet-600 transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
            </button>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-violet-600 transition-all"
                >
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt={user.displayName || "User"} />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[100]">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <div className="text-sm font-bold text-gray-900 truncate">{user.displayName}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <UserIcon className="w-4 h-4" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button 
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                className="bg-violet-600 hover:bg-violet-700"
                onClick={() => signInWithGoogle()}
              >
                Sign In
              </Button>
            )}
            <button
              className="xl:hidden p-2 text-gray-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 shadow-xl animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/?category=${cat}`}
                  className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
              <Button variant="primary" className="w-full mt-4">
                Subscribe Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
