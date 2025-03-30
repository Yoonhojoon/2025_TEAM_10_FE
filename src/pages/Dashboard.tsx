
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
  majorCredits: number;
  requiredMajorCredits: number;
  generalCredits: number;
  requiredGeneralCredits: number;
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
    majorCredits: 0,
    requiredMajorCredits: 0,
    generalCredits: 0,
    requiredGeneralCredits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGraduationData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        console.log("User ID:", user.id);
        console.log("User metadata:", user.user_metadata);

        // Get department_id from user_metadata
        const departmentName = user.user_metadata?.department;
        if (!departmentName) {
          throw new Error("Department information not found in user metadata");
        }

        // 1. Find department_id from departments table
        const { data: departmentData, error: departmentError } = await supabase
          .from('departments')
          .select('department_id')
          .eq('department_name', departmentName)
          .single();

        if (departmentError) {
          console.error("Error fetching department:", departmentError);
          throw departmentError;
        }

        if (!departmentData) {
          throw new Error("Department not found");
        }

        const departmentId = departmentData.department_id;
        console.log("Department ID:", departmentId);

        // 2. 졸업 요건 정보 가져오기
        const { data: requirementData, error: requirementError } = await supabase
          .from('graduation_requirements')
          .select('*')
          .eq('department_id', departmentId)
          .single();

        if (requirementError) {
          console.error("Error fetching graduation requirements:", requirementError);
        }

        // 요건 정보가 없는 경우 기본값 설정
        const requirements = requirementError ? {
          required_total_credits: 130,
          required_major_required: 30,
          required_major_elective: 18,
          required_major_basic: 18,
          required_distribution: 30,
          required_free: 34
        } : requirementData;

        console.log("Graduation requirements:", requirements);
          
        // 진행 데이터 계산 (수강 이력 기반)
        await calculateProgress(requirements);
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
          majorCredits: 40,
          requiredMajorCredits: 66,
          generalCredits: 30,
          requiredGeneralCredits: 40,
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

        console.log("Enrollments data:", enrollmentsData);

        // 4. 수강 이력 기반으로 진행 상황 계산
        let totalCredits = 0;
        let majorRequiredCredits = 0;
        let majorElectiveCredits = 0; 
        let majorBasicCredits = 0;
        let distributionCredits = 0;
        let freeCredits = 0;
        
        enrollmentsData.forEach((enrollment: any) => {
          const course = enrollment.courses;
          if (!course) return;
          
          const credit = course.credit;
          totalCredits += credit;
          
          // 카테고리에 따라 학점 분류
          switch (course.category) {
            case '전공필수':
              majorRequiredCredits += credit;
              break;
            case '전공선택':
              majorElectiveCredits += credit;
              break;
            case '전공기초':
              majorBasicCredits += credit;
              break;
            case '배분이수교과':
              distributionCredits += credit;
              break;
            default: // 자유이수교과 또는 기타
              freeCredits += credit;
              break;
          }
        });

        console.log("Total credits:", totalCredits);
        console.log("Major required credits:", majorRequiredCredits);
        console.log("Major elective credits:", majorElectiveCredits);
        console.log("Major basic credits:", majorBasicCredits);
        console.log("Distribution credits:", distributionCredits);
        console.log("Free credits:", freeCredits);

        // 전체 전공 학점 및 전체 교양 학점 계산
        const majorCredits = majorRequiredCredits + majorElectiveCredits + majorBasicCredits;
        const generalCredits = distributionCredits + freeCredits;
        
        // 전체 필수 학점 계산
        const requiredMajorCredits = requirements.required_major_required + 
                                    requirements.required_major_elective + 
                                    requirements.required_major_basic;
        
        const requiredGeneralCredits = requirements.required_distribution + 
                                     requirements.required_free;
        
        // 진행률 계산
        const majorRequiredPercent = Math.min(Math.round((majorRequiredCredits / Math.max(requirements.required_major_required, 1)) * 100), 100);
        const majorElectivePercent = Math.min(Math.round((majorElectiveCredits / Math.max(requirements.required_major_elective, 1)) * 100), 100);
        const generalRequiredPercent = Math.min(Math.round((distributionCredits / Math.max(requirements.required_distribution, 1)) * 100), 100);
        const generalElectivePercent = Math.min(Math.round((freeCredits / Math.max(requirements.required_free, 1)) * 100), 100);
        
        // 전체 진행률 계산
        const overall = Math.min(Math.round((totalCredits / requirements.required_total_credits) * 100), 100);

        setProgressData({
          overall,
          majorRequired: majorRequiredPercent,
          majorElective: majorElectivePercent,
          generalRequired: generalRequiredPercent,
          generalElective: generalElectivePercent,
          totalCredits,
          requiredCredits: requirements.required_total_credits,
          majorCredits,
          requiredMajorCredits,
          generalCredits,
          requiredGeneralCredits
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
                        <div className="text-sm text-muted-foreground mt-2">
                          {progressData.majorCredits}/{progressData.requiredMajorCredits} 학점
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
                        <div className="text-sm text-muted-foreground mt-2">
                          {progressData.generalCredits}/{progressData.requiredGeneralCredits} 학점
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
