
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ArrowUpRight, Award, BookOpen, GraduationCap, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import CourseProgressModal from "./CourseProgressModal";
import { DbCourse } from "@/components/courses/types"; // Add this import

interface ProgressData {
  overall: number;
  majorRequired: number;
  majorElective: number;
  generalRequired: number;
  generalElective: number;
  industryRequired: number;
  majorBasic: number;
  basicGeneral: number; // 추가: 기초교양
  totalCredits: number;
  requiredCredits: number;
  majorCredits: number;
  requiredMajorCredits: number;
  generalCredits: number;
  requiredGeneralCredits: number;
  basicGeneralCredits: number; // 추가: 기초교양 이수 학점
  requiredBasicGeneralCredits: number; // 추가: 기초교양 필수 학점

  // 각 카테고리별 실제 이수 학점 및 필요 학점 추가
  majorRequiredCredits: number; // 전공필수 이수 학점
  requiredMajorRequiredCredits: number; // 전공필수 필요 학점
  majorElectiveCredits: number; // 전공선택 이수 학점
  requiredMajorElectiveCredits: number; // 전공선택 필요 학점
  majorBasicCredits: number; // 전공기초 이수 학점
  requiredMajorBasicCredits: number; // 전공기초 필요 학점
  generalRequiredCredits: number; // 배분이수 이수 학점
  requiredGeneralRequiredCredits: number; // 배분이수 필요 학점
  generalElectiveCredits: number; // 자유이수 이수 학점
  requiredGeneralElectiveCredits: number; // 자유이수 필요 학점
  industryRequiredCredits: number; // 산학필수 이수 학점
  requiredIndustryCredits: number; // 산학필수 필요 학점
}

// 카테고리 매핑 정보
interface CategoryMap {
  [key: string]: DbCourse['category']; // Update: Improve typing of the category mapping
}

const categoryMapping: CategoryMap = {
  majorRequired: "전공필수",
  majorElective: "전공선택",
  majorBasic: "전공기초",
  generalRequired: "배분이수교과",
  generalElective: "자유이수교과",
  industryRequired: "산학필수",
  basicGeneral: "기초교과"
};

const ProgressDashboard = ({ data }: { data: ProgressData }) => {
  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCategoryKorean, setSelectedCategoryKorean] = useState<DbCourse['category']>("전공필수");
  
  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    // The following line was causing the type error - we need to ensure it's properly typed
    setSelectedCategoryKorean(categoryMapping[category]);
    setModalOpen(true);
  };
  
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
              {/* 전공필수 */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("majorRequired")}
                >
                  <h4 className="font-medium">전공필수</h4>
                  <span className="text-sm font-medium">{data.majorRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.majorRequired} 
                  variant={data.majorRequired >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.majorRequiredCredits} / {data.requiredMajorRequiredCredits} 학점
                </div>
              </div>
              
              {/* 전공선택 */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("majorElective")}
                >
                  <h4 className="font-medium">전공선택</h4>
                  <span className="text-sm font-medium">{data.majorElective}%</span>
                </div>
                <ProgressBar 
                  value={data.majorElective}
                  variant={data.majorElective >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.majorElectiveCredits} / {data.requiredMajorElectiveCredits} 학점
                </div>
              </div>
              
              {/* 전공기초 */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("majorBasic")}
                >
                  <h4 className="font-medium">전공기초</h4>
                  <span className="text-sm font-medium">{data.majorBasic}%</span>
                </div>
                <ProgressBar 
                  value={data.majorBasic}
                  variant={data.majorBasic >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.majorBasicCredits} / {data.requiredMajorBasicCredits} 학점
                </div>
              </div>
              
              {/* 산학필수 */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("industryRequired")}
                >
                  <h4 className="font-medium">산학필수</h4>
                  <span className="text-sm font-medium">{data.industryRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.industryRequired}
                  variant={data.industryRequired >= 100 ? "success" : "warning"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.industryRequiredCredits} / {data.requiredIndustryCredits} 학점
                </div>
              </div>
              
              {/* 배분이수교과 */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("generalRequired")}
                >
                  <h4 className="font-medium">배분이수교과</h4>
                  <span className="text-sm font-medium">{data.generalRequired}%</span>
                </div>
                <ProgressBar 
                  value={data.generalRequired}
                  variant={data.generalRequired >= 100 ? "success" : "warning"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.generalRequiredCredits} / {data.requiredGeneralRequiredCredits} 학점
                </div>
              </div>
              
              {/* 자유이수교과 */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("generalElective")}
                >
                  <h4 className="font-medium">자유이수교과</h4>
                  <span className="text-sm font-medium">{data.generalElective}%</span>
                </div>
                <ProgressBar 
                  value={data.generalElective}
                  variant={data.generalElective >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.generalElectiveCredits} / {data.requiredGeneralElectiveCredits} 학점
                </div>
              </div>
              
              {/* 기초교과 (추가) */}
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center cursor-pointer hover:bg-secondary/40 p-2 rounded-md transition-colors"
                  onClick={() => handleCategoryClick("basicGeneral")}
                >
                  <h4 className="font-medium">기초교과</h4>
                  <span className="text-sm font-medium">{data.basicGeneral}%</span>
                </div>
                <ProgressBar 
                  value={data.basicGeneral}
                  variant={data.basicGeneral >= 100 ? "success" : "default"}
                />
                <div className="text-sm text-muted-foreground text-right mt-1">
                  {data.basicGeneralCredits} / {data.requiredBasicGeneralCredits} 학점
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 모달 컴포넌트 */}
      <CourseProgressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        categoryKorean={selectedCategoryKorean}
      />
    </div>
  );
};

export default ProgressDashboard;
