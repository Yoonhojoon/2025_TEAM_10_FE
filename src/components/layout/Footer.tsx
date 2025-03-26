
import { Graduation } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <Graduation className="h-6 w-6 mr-2 text-primary" />
            <span className="text-xl font-semibold">GradTrack</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                홈
              </Link>
              <Link to="/dashboard" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                대시보드
              </Link>
              <Link to="/courses" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                수강 기록
              </Link>
              <Link to="/schedule" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                시간표 계획
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-center text-sm text-foreground/60">
            © {new Date().getFullYear()} GradTrack. 모든 권리 보유.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
