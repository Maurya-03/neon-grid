import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, MessageSquare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Admin", href: "/admin", icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neon-cyan/20 bg-bg/90 backdrop-blur-xl">
      <div className="container-responsive">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-8 w-8 rounded-lg bg-transparent border border-neon-cyan flex items-center justify-center group-hover:shadow-glow-cyan transition-all duration-200">
              <MessageSquare className="h-4 w-4 text-neon-cyan" />
            </div>
            <span className="text-xl font-orbitron font-bold text-neon-cyan tracking-wider uppercase group-hover:animate-neon-flicker">
              NeonGrid
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href} className="relative group">
                <div
                  className={cn(
                    "px-4 py-2 rounded-md border transition-all duration-200 flex items-center gap-2",
                    "hover:shadow-glow-cyan hover:text-white",
                    isActive(item.href)
                      ? "border-neon-cyan text-neon-cyan shadow-glow-cyan bg-neon-cyan/5"
                      : "border-transparent text-text-secondary hover:border-neon-cyan/50 hover:text-neon-cyan"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium uppercase tracking-wide text-sm">
                    {item.name}
                  </span>
                </div>
                {isActive(item.href) && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-neon-cyan shadow-glow-cyan animate-glow-pulse" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center">
            <button
              className={cn(
                "md:hidden p-2 rounded-md border transition-all duration-200",
                "border-neon-cyan/50 text-neon-cyan hover:shadow-glow-cyan hover:border-neon-cyan"
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-bg/95 backdrop-blur-xl border-b border-neon-cyan/20">
          <nav className="container-responsive py-4 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md border transition-all duration-200",
                  isActive(item.href)
                    ? "border-neon-cyan text-neon-cyan shadow-glow-cyan bg-neon-cyan/5"
                    : "border-transparent text-text-secondary hover:border-neon-cyan/50 hover:text-neon-cyan hover:shadow-glow-cyan"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium uppercase tracking-wide">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
