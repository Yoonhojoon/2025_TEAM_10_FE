import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";
import { BookOpenCheck, GraduationCap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "대시보드", path: "/dashboard" },
  { name: "수강 기록", path: "/courses" },
  { name: "시간표 계획", path: "/schedule" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isLandingPage = location.pathname === "/";
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center text-2xl font-semibold animate-fade-in"
        >
          <GraduationCap className="h-7 w-7 mr-2 text-primary" />
          <span>GradTrack</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 animate-fade-in">
          {!isLandingPage && navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-4 animate-fade-in">
          {isLandingPage ? (
            <>
              <Button variant="outline" size="sm">
                로그인
              </Button>
              <Button size="sm">시작하기</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" icon={<BookOpenCheck size={16} />}>
              졸업 요건 확인
            </Button>
          )}
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-foreground"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-background/95 backdrop-blur-md border-b shadow-lg animate-slide-in-top">
          <div className="py-4 px-4 flex flex-col space-y-2">
            {!isLandingPage && navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium",
                  location.pathname === item.path
                    ? "bg-secondary text-primary"
                    : "text-foreground/70 hover:bg-secondary/50"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-2 flex flex-col space-y-2">
              {isLandingPage ? (
                <>
                  <Button variant="outline">로그인</Button>
                  <Button>시작하기</Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  className="justify-center"
                  icon={<BookOpenCheck size={18} />}
                >
                  졸업 요건 확인
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
