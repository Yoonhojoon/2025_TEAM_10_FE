
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DbCourse } from "@/components/courses/types";
import { ScheduleCourse } from "@/types/schedule";

interface CourseListProps {
  departmentError: string | null;
  isLoadingCourses: boolean;
  dbCourses: DbCourse[];
  fetchCourses: (tabValue: string) => void;
  onSelectCourse: (course: DbCourse) => void;
}

const CourseList = ({ departmentError, isLoadingCourses, dbCourses, fetchCourses, onSelectCourse }: CourseListProps) => {
  return (
    <div className="py-4">
      {departmentError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{departmentError}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="major-required" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="major-required" onClick={() => fetchCourses("major-required")}>전공필수</TabsTrigger>
          <TabsTrigger value="major-elective" onClick={() => fetchCourses("major-elective")}>전공선택</TabsTrigger>
          <TabsTrigger value="general-required" onClick={() => fetchCourses("general-required")}>교양필수</TabsTrigger>
          <TabsTrigger value="general-elective" onClick={() => fetchCourses("general-elective")}>교양선택</TabsTrigger>
          <TabsTrigger value="industry-required" onClick={() => fetchCourses("industry-required")}>산학필수</TabsTrigger>
        </TabsList>
        
        {renderTabContent("major-required", isLoadingCourses, dbCourses, onSelectCourse, departmentError)}
        {renderTabContent("major-elective", isLoadingCourses, dbCourses, onSelectCourse, departmentError)}
        {renderTabContent("general-required", isLoadingCourses, dbCourses, onSelectCourse, departmentError)}
        {renderTabContent("general-elective", isLoadingCourses, dbCourses, onSelectCourse, departmentError)}
        {renderTabContent("industry-required", isLoadingCourses, dbCourses, onSelectCourse, departmentError)}
      </Tabs>
    </div>
  );
};

const renderTabContent = (
  tabValue: string,
  isLoading: boolean,
  courses: DbCourse[],
  onSelectCourse: (course: DbCourse) => void,
  departmentError: string | null
) => {
  return (
    <TabsContent value={tabValue} className="mt-0">
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          과목 정보를 불러오는 중...
        </div>
      ) : courses.length > 0 ? (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {courses.map(course => (
            <div 
              key={course.course_id} 
              className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => onSelectCourse(course)}
            >
              <div className="font-medium">{course.course_name}</div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>{course.course_code}</span>
                <span>{course.credit}학점</span>
              </div>
            </div>
          ))}
        </div>
      ) : tabValue.includes("major") && departmentError ? (
        <div className="py-8 text-center text-muted-foreground">
          학과 정보가 필요합니다. 프로필 설정을 완료해주세요.
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          {tabValue === "major-required" && "등록된 전공필수 과목이 없습니다."}
          {tabValue === "major-elective" && "등록된 전공선택 과목이 없습니다."}
          {tabValue === "general-required" && "등록된 교양필수 과목이 없습니다."}
          {tabValue === "general-elective" && "등록된 교양선택 과목이 없습니다."}
          {tabValue === "industry-required" && "등록된 산학필수 과목이 없습니다."}
        </div>
      )}
    </TabsContent>
  );
};

export default CourseList;
