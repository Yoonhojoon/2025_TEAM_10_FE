
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import { DbCourse } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CourseListProps {
  departmentError: string | null;
  isLoadingCourses: boolean;
  dbCourses: DbCourse[];
  fetchCourses: (tabValue: string) => void;
  onSelectCourse: (course: DbCourse) => void;
}

const CourseList = ({
  departmentError,
  isLoadingCourses,
  dbCourses,
  fetchCourses,
  onSelectCourse,
}: CourseListProps) => {
  const [activeTab, setActiveTab] = useState("major-required");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchCourses(value);
  };
  
  return (
    <div className="mt-6">
      {departmentError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{departmentError}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="major-required">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="major-required">전공필수</TabsTrigger>
          <TabsTrigger value="major-elective">전공선택</TabsTrigger>
          <TabsTrigger value="general-required">배분이수</TabsTrigger>
          <TabsTrigger value="general-elective">자유이수</TabsTrigger>
          <TabsTrigger value="industry-required">산학필수</TabsTrigger>
          <TabsTrigger value="basic-general">기초교양</TabsTrigger>
          <TabsTrigger value="all">전체</TabsTrigger>
        </TabsList>
        
        {/* The content for each tab is the same, so we can use a single component for all */}
        {["major-required", "major-elective", "general-required", "general-elective", "industry-required", "basic-general", "all"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {isLoadingCourses ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : dbCourses.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {tab === activeTab && <p>검색 결과가 없습니다.</p>}
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {dbCourses.map((course) => (
                  <div
                    key={course.course_id}
                    className="p-3 border rounded-md flex justify-between items-center hover:bg-accent/20 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{course.course_name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {course.course_code} · {course.credit}학점
                        {course.schedule_time && <span> · {course.schedule_time}</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectCourse(course)}
                    >
                      추가
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CourseList;
