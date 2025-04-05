
import { Home, Calendar, GraduationCap, Menu, Settings } from "lucide-react";
import { Link, NavLink as RouterNavLink } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Logo = () => (
  <Link to="/" className="flex items-center space-x-2 font-bold">
    <GraduationCap className="h-6 w-6 text-primary" />
    <span>KUBS Scheduler</span>
  </Link>
);

interface NavLinkProps {
  to: string;
  text: string;
}

const NavLink = ({ to, text }: NavLinkProps) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-secondary/50 ${
        isActive ? "bg-secondary/50 text-primary" : "text-muted-foreground"
      }`
    }
  >
    {text}
  </RouterNavLink>
);

interface MobileNavLinkProps {
  to: string;
  text: string;
  icon: React.ReactNode;
}

const MobileNavLink = ({ to, text, icon }: MobileNavLinkProps) => (
  <Link
    to={to}
    className="flex items-center space-x-2 py-2 px-4 rounded-md transition-colors hover:bg-secondary/50"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

const Header = () => {
  const { signOut, user } = useAuth();
  
  return (
    <header className="fixed w-full backdrop-blur-md bg-background/80 z-40 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Logo />
          
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" text="홈" />
            <NavLink to="/schedule" text="시간표 만들기" />
            <NavLink to="/courses" text="수강 기록" />
            <NavLink to="/settings" text="설정" />
          </div>
          
          {!user ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">회원가입</Button>
              </Link>
            </div>
          ) : (
            <Button onClick={signOut} variant="outline" size="sm" className="hidden md:flex">
              로그아웃
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger className="md:hidden p-2">
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-4 mt-6">
                <MobileNavLink to="/" text="홈" icon={<Home size={18} />} />
                <MobileNavLink to="/schedule" text="시간표 만들기" icon={<Calendar size={18} />} />
                <MobileNavLink to="/courses" text="수강 기록" icon={<GraduationCap size={18} />} />
                <MobileNavLink to="/settings" text="설정" icon={<Settings size={18} />} />
                
                {!user ? (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-log-in mr-2 h-4 w-4"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                        로그인
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button className="w-full justify-start" size="sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-user-plus mr-2 h-4 w-4"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" x2="19" y1="8" y2="14" />
                          <line x1="16" x2="22" y1="11" y2="11" />
                        </svg>
                        회원가입
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button onClick={signOut} variant="outline" className="w-full justify-start" size="sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-log-out mr-2 h-4 w-4"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    로그아웃
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
