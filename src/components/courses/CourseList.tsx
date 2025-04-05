import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DbCourse } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface CourseListProps {
  departmentError: string | null;
  isLoadingCourses: boolean;
  dbCourses: DbCourse[];
  fetchCourses: (tab: string) => Promise<void>;
  onSelectCourse: (course: DbCourse) => void;
}

const CourseList = ({
  departmentError,
  isLoadingCourses,
  dbCourses,
  fetchCourses,
  onSelectCourse
}: CourseListProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    await fetchCourses(value);
  };

  // Filter courses based on search query
  const filteredCourses = dbCourses.filter(course => 
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (departmentError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>학과 정보 오류</AlertTitle>
        <AlertDescription>{departmentError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="mt-4 mb-4">
        <Input
          placeholder="과목 이름 또는 코드로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="major-required">전공</TabsTrigger>
          <TabsTrigger value="general-required">교양</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-2">
          <CourseListContent
            courses={filteredCourses}
            isLoading={isLoadingCourses}
            onSelectCourse={onSelectCourse}
          />
        </TabsContent>
        
        <TabsContent value="major-required" className="pt-2">
          <Tabs defaultValue="major-required">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="major-required" onClick={() => fetchCourses("major-required")}>필수</TabsTrigger>
              <TabsTrigger value="major-elective" onClick={() => fetchCourses("major-elective")}>선택</TabsTrigger>
              <TabsTrigger value="major-basic" onClick={() => fetchCourses("major-basic")}>기초</TabsTrigger>
            </TabsList>
            
            <TabsContent value="major-required">
              <CourseListContent
                courses={filteredCourses}
                isLoading={isLoadingCourses}
                onSelectCourse={onSelectCourse}
              />
            </TabsContent>
            
            <TabsContent value="major-elective">
              <CourseListContent
                courses={filteredCourses}
                isLoading={isLoadingCourses}
                onSelectCourse={onSelectCourse}
              />
            </TabsContent>
            
            <TabsContent value="major-basic">
              <CourseListContent
                courses={filteredCourses}
                isLoading={isLoadingCourses}
                onSelectCourse={onSelectCourse}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="general-required" className="pt-2">
          <Tabs defaultValue="general-required">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general-required" onClick={() => fetchCourses("general-required")}>필수</TabsTrigger>
              <TabsTrigger value="general-elective" onClick={() => fetchCourses("general-elective")}>선택</TabsTrigger>
              <TabsTrigger value="basic-general" onClick={() => fetchCourses("basic-general")}>기초</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general-required">
              <CourseListContent
                courses={filteredCourses}
                isLoading={isLoadingCourses}
                onSelectCourse={onSelectCourse}
              />
            </TabsContent>
            
            <TabsContent value="general-elective">
              <CourseListContent
                courses={filteredCourses}
                isLoading={isLoadingCourses}
                onSelectCourse={onSelectCourse}
              />
            </TabsContent>
            
            <TabsContent value="basic-general">
              <CourseListContent
                courses={filteredCourses}
                isLoading={isLoadingCourses}
                onSelectCourse={onSelectCourse}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </>
  );
};

interface CourseListContentProps {
  courses: DbCourse[];
  isLoading: boolean;
  onSelectCourse: (course: DbCourse) => void;
}

const CourseListContent = ({ courses, isLoading, onSelectCourse }: CourseListContentProps) => {
  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading courses...</div>;
  }

  if (!courses || courses.length === 0) {
    return <div className="text-center text-muted-foreground">No courses found.</div>;
  }

  return (
    <ScrollArea className="rounded-md border h-[400px] w-full">
      <div className="p-4">
        {courses.map((course) => (
          <div
            key={course.course_id}
            className="mb-2 p-3 rounded-md bg-secondary/50 hover:bg-secondary/80 cursor-pointer transition-colors"
            onClick={() => onSelectCourse(course)}
          >
            <div className="font-medium">{course.course_name}</div>
            <div className="text-sm text-muted-foreground">
              {course.course_code} - {course.credit} 학점
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CourseList;
