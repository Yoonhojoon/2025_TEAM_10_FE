
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ArrowUpRight, Award, BookOpen, GraduationCap, Layers } from "lucide-react";
import { Link } from "react-router-dom";

interface ProgressData {
  overall: number;
  majorRequired: number;
  majorElective: number;
  generalRequired: number;
  generalElective: number;
  totalCredits: number;
  requiredCredits: number;
}

const ProgressDashboard = ({ data }: { data: ProgressData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">전체 진행률</p>
                <h3 className="text-2xl font-bold mt-1">{data.overall}%</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <ProgressBar 
              value={data.overall} 
              className="mt-4" 
              size="md" 
              variant={data.overall >= 75 ? "success" : "default"}
            />
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">취득 학점</p>
                <h3 className="text-2xl font-bold mt-1">{data.totalCredits} / {data.requiredCredits}</h3>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10">
                <Layers className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <ProgressBar 
              value={data.totalCredits} 
              max={data.requiredCredits} 
              className="mt-4" 
              size="md" 
              variant="success"
            />
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">전공 필수 과목</p>
                <h3 className="text-2xl font-bold mt-1">{data.majorRequired}%</h3>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <BookOpen className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <ProgressBar 
              value={data.majorRequired} 
              className="mt-4" 
              size="md" 
              variant="warning"
            />
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">졸업 가능 상태</p>
                <h3 className="text-2xl font-bold mt-1">{data.overall >= 90 ? "가능" : "진행중"}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-2">
              <Link 
                to="/courses" 
                className="text-sm font-medium text-primary flex items-center hover:underline"
              >
                수강 기록 관리
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>졸업 요건 진행 상황</CardTitle>
            <CardDescription>카테고리별 졸업 요건 충족 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">전공 필수</h4>
                  <span className="text-sm font-medium">{data.majorRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.majorRequired} 
                  variant={data.majorRequired >= 100 ? "success" : "default"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">전공 선택</h4>
                  <span className="text-sm font-medium">{data.majorElective}%</span>
                </div>
                <ProgressBar 
                  value={data.majorElective}
                  variant={data.majorElective >= 100 ? "success" : "default"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">교양 필수</h4>
                  <span className="text-sm font-medium">{data.generalRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.generalRequired}
                  variant={data.generalRequired >= 100 ? "success" : "warning"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">교양 선택</h4>
                  <span className="text-sm font-medium">{data.generalElective}%</span>
                </div>
                <ProgressBar 
                  value={data.generalElective}
                  variant={data.generalElective >= 100 ? "success" : "default"}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>추천 과목</CardTitle>
            <CardDescription>남은 졸업 요건 충족을 위한 추천 과목</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="p-3 rounded-lg bg-secondary/70 animate-fade-in">
                <div className="font-medium">알고리즘 개론</div>
                <div className="text-sm text-muted-foreground mt-1">전공필수 / 3학점</div>
              </li>
              <li className="p-3 rounded-lg bg-secondary/70 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <div className="font-medium">소프트웨어 공학</div>
                <div className="text-sm text-muted-foreground mt-1">전공선택 / 3학점</div>
              </li>
              <li className="p-3 rounded-lg bg-secondary/70 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="font-medium">영어 회화</div>
                <div className="text-sm text-muted-foreground mt-1">교양필수 / 2학점</div>
              </li>
              <li className="p-3 rounded-lg bg-secondary/70 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="font-medium">철학의 이해</div>
                <div className="text-sm text-muted-foreground mt-1">교양선택 / 2학점</div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressDashboard;
