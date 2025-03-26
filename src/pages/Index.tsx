
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CheckCircle, ChevronRight, Clock, GraduationCap, ListChecks, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <ListChecks className="h-6 w-6 text-primary" />,
    title: "수강 기록 관리",
    description: "지금까지 수강한 모든 과목을 쉽게 추적하고 관리하세요.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "졸업 요건 분석",
    description: "학과별 졸업 요건에 맞춰 진행 상황을 실시간으로 확인하세요.",
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "맞춤 코스 추천",
    description: "졸업을 위해 필요한 최적의 과목을 자동으로 추천해드립니다.",
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "시간표 계획",
    description: "시간 충돌 없이 완벽한 학기 계획을 세워보세요.",
  },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                  졸업까지 <span className="text-primary">쉽게</span><br />
                  한눈에 <span className="text-primary">명확하게</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
                  GradTrack으로 복잡한 졸업 요건을 간편하게 추적하고, 최적의 수강 계획을 세워보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      icon={<ChevronRight size={18} />}
                      iconPosition="right"
                    >
                      시작하기
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                  >
                    더 알아보기
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-full h-full bg-primary/5 rounded-2xl border border-primary/20"></div>
                  <div className="relative z-10 bg-card rounded-2xl border shadow-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                      alt="Student planning graduation"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                완벽한 졸업 계획을 위한 모든 기능
              </h2>
              <p className="text-xl text-muted-foreground">
                GradTrack은 학생들이 졸업 요건을 충족하기 위한 과정을 간편하게 관리할 수 있도록 도와줍니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="hover-scale h-full p-8"
                  variant="glass"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-3 rounded-full bg-primary/10 inline-block mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                학생들의 경험
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((testimonial) => (
                  <Card key={testimonial} className="p-8 hover-scale" variant="outline">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium">홍길동</h4>
                        <p className="text-sm text-muted-foreground">컴퓨터공학과 3학년</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      "GradTrack 덕분에 복잡한 졸업 요건을 한눈에 파악할 수 있었어요. 어떤 과목을 더 들어야 하는지 명확하게 알 수 있어서 학기 계획이 훨씬 쉬워졌습니다."
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                지금 바로 GradTrack과 함께 졸업 계획을 시작하세요
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                무료로 시작하고 복잡한 졸업 요건을 쉽게 관리하세요.
              </p>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  icon={<ChevronRight size={18} />}
                  iconPosition="right"
                >
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
