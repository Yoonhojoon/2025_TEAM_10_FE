
import { Button } from "@/components/common/Button";
import ProgressDashboard from "@/components/dashboard/ProgressDashboard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GraduationRequirementsModal from "@/components/dashboard/GraduationRequirementsModal";
import { BookOpenCheck, Settings, CirclePercent } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CircularProgress } from "@/components/common/CircularProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProgressData {
  overall: number;
  majorRequired: number;
  majorElective: number;
  generalRequired: number;
  generalElective: number;
  totalCredits: number;
  requiredCredits: number;
}

const Dashboard = () => {
  const [profileComplete, setProfileComplete] = useState(true);
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData>({
    overall: 0,
    majorRequired: 0,
    majorElective: 0,
    generalRequired: 0,
    generalElective: 0,
    totalCredits: 0,
    requiredCredits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGraduationData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // 1. 사용자 정보 가져오기
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('department_id')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;

        // 2. 졸업 요건 정보 가져오기
        const { data: requirementData, error: requirementError } = await supabase
          .from('graduation_requirements')
          .select('*')
          .eq('department_id', userData.department_id)
          .single();

        if (requirementError) {
          // 요건 정보가 없는 경우 기본값 설정
          console.log("No graduation requirements found, using default values");
          const defaultRequirements = {
            required_total_credits: 130,
            required_major_credits: 66,
            required_general_credits: 40
          };
          
          // 진행 데이터 계산 (수강 이력 기반)
          await calculateProgress(defaultRequirements);
        } else {
          // 진행 데이터 계산 (수강 이력 기반)
          await calculateProgress(requirementData);
        }
      } catch (error: any) {
        console.error("Error fetching graduation data:", error);
        toast({
          title: "데이터 로딩 오류",
          description: "졸업 진행 상황을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        });
        
        // 에러 발생 시 기본 데이터로 표시
        setProgressData({
          overall: 65,
          majorRequired: 80,
          majorElective: 60,
          generalRequired: 90,
          generalElective: 45,
          totalCredits: 78,
          requiredCredits: 120,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const calculateProgress = async (requirements: any) => {
      try {
        // 3. 수강 이력 가져오기
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            course_id,
            courses(
              credit,
              category
            )
          `)
          .eq('user_id', user!.id);

        if (enrollmentsError) throw enrollmentsError;

        // 4. 수강 이력 기반으로 진행 상황 계산
        let totalCredits = 0;
        let majorCredits = 0;
        let generalCredits = 0;
        
        // 필수/선택 구분을 위한 임시 비율 (실제로는 DB에서 가져와야 함)
        const majorRequiredRatio = 0.6; // 전공 필수 비율 (예: 60%)
        const generalRequiredRatio = 0.7; // 교양 필수 비율 (예: 70%)

        enrollmentsData.forEach((enrollment: any) => {
          const course = enrollment.courses;
          if (!course) return;
          
          totalCredits += course.credit;
          
          if (course.category === '전공') {
            majorCredits += course.credit;
          } else if (course.category === '교양') {
            generalCredits += course.credit;
          }
        });

        // 필수/선택 구분 임시 계산 (실제로는 DB에서 가져와야 함)
        const majorRequired = (majorCredits * majorRequiredRatio);
        const majorElective = (majorCredits * (1 - majorRequiredRatio));
        const generalRequired = (generalCredits * generalRequiredRatio);
        const generalElective = (generalCredits * (1 - generalRequiredRatio));

        // 전체 진행률 계산
        const overall = Math.min(Math.round((totalCredits / requirements.required_total_credits) * 100), 100);
        
        // 전공 진행률 계산
        const majorRequiredPercent = Math.min(Math.round((majorRequired / (requirements.required_major_credits * majorRequiredRatio)) * 100), 100);
        const majorElectivePercent = Math.min(Math.round((majorElective / (requirements.required_major_credits * (1 - majorRequiredRatio))) * 100), 100);
        
        // 교양 진행률 계산
        const generalRequiredPercent = Math.min(Math.round((generalRequired / (requirements.required_general_credits * generalRequiredRatio)) * 100), 100);
        const generalElectivePercent = Math.min(Math.round((generalElective / (requirements.required_general_credits * (1 - generalRequiredRatio))) * 100), 100);

        setProgressData({
          overall,
          majorRequired: majorRequiredPercent,
          majorElective: majorElectivePercent,
          generalRequired: generalRequiredPercent,
          generalElective: generalElectivePercent,
          totalCredits,
          requiredCredits: requirements.required_total_credits
        });
      } catch (error) {
        console.error("Error calculating progress:", error);
        throw error;
      }
    };

    fetchGraduationData();
  }, [user]);
  
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
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : (
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
                        value={progressData.overall} 
                        size="lg" 
                        variant="primary"
                        label="전체 이수율"
                      />
                      <div className="mt-3 text-center">
                        <div className="text-sm text-muted-foreground">
                          {progressData.totalCredits}/{progressData.requiredCredits} 학점
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <CircularProgress 
                        value={(progressData.majorRequired + progressData.majorElective) / 2} 
                        size="lg" 
                        variant="success"
                        label="전공 이수율"
                      />
                      <div className="mt-3 text-center">
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                            <span>필수 {progressData.majorRequired}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-300"></div>
                            <span>선택 {progressData.majorElective}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <CircularProgress 
                        value={(progressData.generalRequired + progressData.generalElective) / 2} 
                        size="lg" 
                        variant="warning"
                        label="교양 이수율"
                      />
                      <div className="mt-3 text-center">
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                            <span>필수 {progressData.generalRequired}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-amber-300"></div>
                            <span>선택 {progressData.generalElective}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <ProgressDashboard data={progressData} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
