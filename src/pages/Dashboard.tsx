
import { Button } from "@/components/common/Button";
import ProgressDashboard from "@/components/dashboard/ProgressDashboard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GraduationRequirementsModal from "@/components/dashboard/GraduationRequirementsModal";
import { BookOpenCheck, Settings, CirclePercent } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CircularProgress } from "@/components/common/CircularProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";

const progressMockData = {
  overall: 65,
  majorRequired: 80,
  majorElective: 60,
  generalRequired: 90,
  generalElective: 45,
  totalCredits: 78,
  requiredCredits: 120,
};

const Dashboard = () => {
  const [profileComplete, setProfileComplete] = useState(true);
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 animate-fade-in">나의 졸업 현황</h1>
              <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
                전공, 교양, 필수, 선택 과목의 진행 상황을 확인하세요.
              </p>
            </div>
            
            <div className="flex space-x-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <GraduationRequirementsModal>
                <Button 
                  variant="outline" 
                  icon={<BookOpenCheck size={18} />}
                >
                  졸업 요건 살펴보기
                </Button>
              </GraduationRequirementsModal>
              
              <Button 
                variant="outline" 
                icon={<Settings size={18} />}
              >
                설정
              </Button>
            </div>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Card className="mb-8">
              <CardHeader className="pb-2">
                <CardTitle>졸업 진행 상황</CardTitle>
                <CardDescription>전체 이수율과 전공/교양별 세부 이수율</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                  <div className="flex flex-col items-center">
                    <CircularProgress 
                      value={progressMockData.overall} 
                      size="lg" 
                      variant="primary"
                      label="전체 이수율"
                    />
                    <div className="mt-3 text-center">
                      <div className="text-sm text-muted-foreground">
                        {progressMockData.totalCredits}/{progressMockData.requiredCredits} 학점
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <CircularProgress 
                      value={(progressMockData.majorRequired + progressMockData.majorElective) / 2} 
                      size="lg" 
                      variant="success"
                      label="전공 이수율"
                    />
                    <div className="mt-3 text-center">
                      <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                          <span>필수 {progressMockData.majorRequired}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-emerald-300"></div>
                          <span>선택 {progressMockData.majorElective}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <CircularProgress 
                      value={(progressMockData.generalRequired + progressMockData.generalElective) / 2} 
                      size="lg" 
                      variant="warning"
                      label="교양 이수율"
                    />
                    <div className="mt-3 text-center">
                      <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                          <span>필수 {progressMockData.generalRequired}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-amber-300"></div>
                          <span>선택 {progressMockData.generalElective}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ProgressDashboard data={progressMockData} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
