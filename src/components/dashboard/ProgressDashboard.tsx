
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ArrowUpRight, Award, BookOpen, GraduationCap, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Course } from "../courses/types";

interface ProgressData {
  overall: number;
  majorRequired: number;
  majorElective: number;
  generalRequired: number;
  generalElective: number;
  industryRequired: number;
  majorBasic: number;
  totalCredits: number;
  requiredCredits: number;
  majorCredits: number;
  requiredMajorCredits: number;
  generalCredits: number;
  requiredGeneralCredits: number;
}

const ProgressDashboard = ({ data }: { data: ProgressData }) => {
  // Calculate creditValues based on estimates from the percentages and required credits
  const majorRequiredCredits = Math.round(data.requiredMajorCredits * (data.majorRequired / 100));
  const majorElectiveCredits = Math.round(data.requiredMajorCredits * (data.majorElective / 100));
  const majorBasicCredits = Math.round(data.requiredMajorCredits * (data.majorBasic / 100));
  const generalRequiredCredits = Math.round(data.requiredGeneralCredits * (data.generalRequired / 100));
  const generalElectiveCredits = Math.round(data.requiredGeneralCredits * (data.generalElective / 100));
  const industryRequiredCredits = Math.round(data.requiredMajorCredits * (data.industryRequired / 100));

  const requiredMajorRequiredCredits = Math.round(data.requiredMajorCredits * 0.45); // Approximately for required major courses
  const requiredMajorElectiveCredits = Math.round(data.requiredMajorCredits * 0.55); // Approximately for elective major courses
  const requiredMajorBasicCredits = Math.round(data.requiredMajorCredits * 0.2);
  const requiredGenRequiredCredits = Math.round(data.requiredGeneralCredits * 0.7); // Approximately for required general courses
  const requiredGenElectiveCredits = Math.round(data.requiredGeneralCredits * 0.3); // Approximately for elective general courses
  const requiredIndustryCredits = Math.round(data.requiredMajorCredits * 0.15);

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
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>졸업 요건 진행 상황</CardTitle>
            <CardDescription>카테고리별 졸업 요건 충족 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">전공필수</h4>
                  <span className="text-sm font-medium">{data.majorRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.majorRequired} 
                  variant={data.majorRequired >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {majorRequiredCredits} / {requiredMajorRequiredCredits} 학점
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">전공선택</h4>
                  <span className="text-sm font-medium">{data.majorElective}%</span>
                </div>
                <ProgressBar 
                  value={data.majorElective}
                  variant={data.majorElective >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {majorElectiveCredits} / {requiredMajorElectiveCredits} 학점
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">전공기초</h4>
                  <span className="text-sm font-medium">{data.majorBasic}%</span>
                </div>
                <ProgressBar 
                  value={data.majorBasic}
                  variant={data.majorBasic >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {majorBasicCredits} / {requiredMajorBasicCredits} 학점
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">산학필수</h4>
                  <span className="text-sm font-medium">{data.industryRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.industryRequired}
                  variant={data.industryRequired >= 100 ? "success" : "warning"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {industryRequiredCredits} / {requiredIndustryCredits} 학점
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">배분이수교과</h4>
                  <span className="text-sm font-medium">{data.generalRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.generalRequired}
                  variant={data.generalRequired >= 100 ? "success" : "warning"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {generalRequiredCredits} / {requiredGenRequiredCredits} 학점
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">자유이수교과</h4>
                  <span className="text-sm font-medium">{data.generalElective}%</span>
                </div>
                <ProgressBar 
                  value={data.generalElective}
                  variant={data.generalElective >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {generalElectiveCredits} / {requiredGenElectiveCredits} 학점
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressDashboard;
