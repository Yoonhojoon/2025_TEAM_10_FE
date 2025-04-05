
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScheduleCourse } from "@/types/schedule";
import CourseTable from "./CourseTable";
import CourseSelector from "./CourseSelector";
import { Course } from "./types";

interface CourseHistoryInputProps {
  onAddCourse: (course: Omit<ScheduleCourse, "id">) => void;
  courses?: Course[];
  onDeleteCourse?: (id: string) => void;
  isLoading?: boolean;
}

const CourseHistoryInput = ({ 
  onAddCourse,
  courses = [],
  onDeleteCourse = () => {},
  isLoading = false
}: CourseHistoryInputProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleNavigateToSchedule = () => {
    navigate('/schedule');
    toast({
      title: "시간표 생성",
      description: "시간표 생성 페이지로 이동했습니다.",
      duration: 3000,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>수강 기록 관리</CardTitle>
          <CardDescription>지금까지 수강한 과목을 입력하세요</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={handleNavigateToSchedule}
          >
            <Calendar className="mr-2 h-4 w-4" />
            시간표 생성하기
          </Button>
          <CourseSelector onAddCourse={onAddCourse} />
        </div>
      </CardHeader>
      <CardContent>
        <CourseTable 
          courses={courses} 
          onDeleteCourse={onDeleteCourse} 
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default CourseHistoryInput;
