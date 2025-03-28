
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인한 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-4 bg-background border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">교육과정 관리 시스템</h1>
          <nav>
            <Link to="/auth">
              <Button>로그인</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="container mx-auto py-20 px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">효율적인 학업 계획을 시작하세요</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            학업 계획, 시간표 관리, 졸업 요건 추적까지 한 곳에서 관리하세요.
          </p>
          <Link to="/auth">
            <Button size="lg" className="animate-pulse">시작하기</Button>
          </Link>
        </section>
        
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">수강 계획</h3>
                <p className="text-muted-foreground">
                  필요한 과목을 계획하고 시간표를 미리 구성해 보세요.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">졸업 요건 추적</h3>
                <p className="text-muted-foreground">
                  졸업에 필요한 요건들을 확인하고 진행 상황을 추적하세요.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">학업 성취 분석</h3>
                <p className="text-muted-foreground">
                  학업 성취도를 분석하고 개선할 점을 파악하세요.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 교육과정 관리 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
