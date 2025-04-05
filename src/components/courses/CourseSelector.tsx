import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import CourseList from "./CourseList";
import AddCourseForm from "./AddCourseForm";
import { DbCourse, Course } from "./types";
import { ScheduleCourse } from "@/types/schedule";

interface CourseSelectorProps {
  onAddCourse: (course: Omit<ScheduleCourse, "id">) => void;
}

const CourseSelector = ({ onAddCourse }: CourseSelectorProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [dbCourses, setDbCourses] = useState<DbCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const [generalDepartmentId, setGeneralDepartmentId] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserDepartment = async () => {
      if (!user) return;
      
      setDepartmentError(null);
      console.log("Fetching department for user ID:", user.id);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('department_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching user department:", error);
          throw error;
        }
        
        if (data && data.department_id) {
          console.log("Found user department ID:", data.department_id);
          setUserDepartmentId(data.department_id);
          
          const { data: deptData, error: deptError } = await supabase
            .from('departments')
            .select('department_name')
            .eq('department_id', data.department_id)
            .single();
            
          if (!deptError && deptData) {
            console.log("Department name:", deptData.department_name);
          }
        } else {
          console.log("No department found for user:", user.id);
          setDepartmentError("사용자의 학과 정보를 찾을 수 없습니다. 프로필 설정을 완료해주세요.");
        }
        
        const { data: generalDept, error: generalDeptError } = await supabase
          .from('departments')
          .select('department_id')
          .eq('department_name', '전체')
          .maybeSingle();
        
        if (generalDeptError) {
          console.error("Error fetching general department:", generalDeptError);
        } else if (generalDept) {
          console.log("General department ID:", generalDept.department_id);
          setGeneralDepartmentId(generalDept.department_id);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartmentError("학과 정보를 불러오는 데 문제가 발생했습니다.");
      }
    };
    
    fetchUserDepartment();
  }, [user]);
  
  const fetchCourses = async (tabValue: string) => {
    setDbCourses([]);
    setIsLoadingCourses(true);
    
    try {
      let query = supabase.from('courses').select('*');
      
      if (tabValue === "major-required" && userDepartmentId) {
        query = query
          .in('department_id', userDepartmentId && generalDepartmentId ? [userDepartmentId, generalDepartmentId] : [userDepartmentId])
          .in('category', ['전공필수', '전공기초']);
      } else if (tabValue === "major-elective" && userDepartmentId) {
        query = query
          .in('department_id', userDepartmentId && generalDepartmentId ? [userDepartmentId, generalDepartmentId] : [userDepartmentId])
          .eq('category', '전공선택');
      } else if (tabValue === "general-required") {
        const departmentIds = [];
        if (userDepartmentId) departmentIds.push(userDepartmentId);
        if (generalDepartmentId) departmentIds.push(generalDepartmentId);
        
        if (departmentIds.length > 0) {
          query = query
            .in('department_id', departmentIds)
            .eq('category', '배분이수교과');
        } else {
          query = query.eq('category', '배분이수교과');
        }
      } else if (tabValue === "general-elective") {
        const departmentIds = [];
        if (userDepartmentId) departmentIds.push(userDepartmentId);
        if (generalDepartmentId) departmentIds.push(generalDepartmentId);
        
        if (departmentIds.length > 0) {
          query = query
            .in('department_id', departmentIds)
            .eq('category', '자유이수교과');
        } else {
          query = query.eq('category', '자유이수교과');
        }
      } else if (tabValue === "industry-required") {
        const departmentIds = [];
        if (userDepartmentId) departmentIds.push(userDepartmentId);
        if (generalDepartmentId) departmentIds.push(generalDepartmentId);
        
        if (departmentIds.length > 0) {
          query = query
            .in('department_id', departmentIds)
            .eq('category', '산학필수');
        } else {
          query = query.eq('category', '산학필수');
        }
      } else if (tabValue === "basic-general") {
        const departmentIds = [];
        if (userDepartmentId) departmentIds.push(userDepartmentId);
        if (generalDepartmentId) departmentIds.push(generalDepartmentId);
        
        if (departmentIds.length > 0) {
          query = query
            .in('department_id', departmentIds)
            .eq('category', '기초교과');
        } else {
          query = query.eq('category', '기초교과');
        }
      } else if (tabValue === "all") {
        const departmentIds = [];
        if (userDepartmentId) departmentIds.push(userDepartmentId);
        if (generalDepartmentId) departmentIds.push(generalDepartmentId);
        
        if (departmentIds.length > 0) {
          query = query.in('department_id', departmentIds);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log(`Fetched ${data.length} courses for ${tabValue}`);
        setDbCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "오류 발생",
        description: "과목 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const selectCourseFromDb = (course: DbCourse) => {
    try {
      console.log("Selecting course from DB:", course);
      
      const mappedCategory = (): "majorRequired" | "majorElective" | "generalRequired" | "generalElective" | "industryRequired" | "basicGeneral" => {
        switch (course.category) {
          case "전공필수":
          case "전공기초":
            return "majorRequired";
          case "전공선택":
            return "majorElective";
          case "배분이수교과":
            return "generalRequired";
          case "자유이수교과":
            return "generalElective";
          case "산학필수":
            return "industryRequired";
          case "기초교과":
            return "basicGeneral";
          default:
            return "generalElective";
        }
      };

      console.log("Course data:", {
        name: course.course_name,
        code: course.course_code,
        category: course.category,
        schedule_time: course.schedule_time
      });

      if (!course.schedule_time) {
        console.warn("Missing schedule_time for course:", course.course_name);
      }

      console.log("Parsing schedule time:", course.schedule_time);
      const scheduleTimeInfo = course.schedule_time ? course.schedule_time.split(' ') : [];
      let day: "mon" | "tue" | "wed" | "thu" | "fri" = "mon";
      let startTime = "10:00";
      let endTime = "12:00";
      
      if (scheduleTimeInfo.length >= 2) {
        const dayMapping: Record<string, "mon" | "tue" | "wed" | "thu" | "fri"> = {
          "월": "mon", "화": "tue", "수": "wed", "목": "thu", "금": "fri",
          "mon": "mon", "tue": "tue", "wed": "wed", "thu": "thu", "fri": "fri"
        };
        
        const rawDay = scheduleTimeInfo[0].toLowerCase();
        day = dayMapping[rawDay] || "mon";
        
        console.log("Day mapping:", rawDay, "->", day);
        
        const timeRange = scheduleTimeInfo[1].split('-');
        if (timeRange.length === 2) {
          startTime = timeRange[0];
          endTime = timeRange[1];
          console.log("Time range parsed:", { startTime, endTime });
        } else {
          console.warn("Invalid time range format:", scheduleTimeInfo[1]);
        }
      } else {
        console.warn("Invalid schedule time format:", course.schedule_time);
      }

      const adaptedCourse: Omit<ScheduleCourse, "id"> = {
        name: course.course_name,
        code: course.course_code,
        credit: course.credit,
        day: day,
        startTime: startTime,
        endTime: endTime,
        location: course.classroom || "미정",
        fromHistory: true
      };

      console.log("Adapted course for adding:", adaptedCourse);
      onAddCourse(adaptedCourse);
    } catch (error) {
      console.error("Error selecting course:", error, course);
      toast({
        title: "과목 추가 오류",
        description: `과목을 추가하는 중 오류가 발생했습니다: ${course.course_name}`,
        variant: "destructive",
      });
    }
  };

  const handleAddManualCourse = (course: Omit<Course, "id">) => {
    const adaptedCourse: Omit<ScheduleCourse, "id"> = {
      name: course.name,
      code: course.code,
      credit: course.credit,
      day: "mon",
      startTime: "10:00",
      endTime: "12:00",
      location: "미정",
      fromHistory: true
    };
    
    onAddCourse(adaptedCourse);
    setIsAdding(false);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          과목 추가
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>과목 추가</SheetTitle>
          <SheetDescription>
            아래 카테고리에서 과목을 선택하거나 직접 입력하세요.
          </SheetDescription>
        </SheetHeader>
        
        {isAdding ? (
          <div className="mt-6 p-4 rounded-lg border bg-secondary/30">
            <AddCourseForm 
              onClose={() => setIsAdding(false)}
              onAddCourse={handleAddManualCourse}
            />
          </div>
        ) : (
          <>
            <CourseList 
              departmentError={departmentError}
              isLoadingCourses={isLoadingCourses}
              dbCourses={dbCourses}
              fetchCourses={fetchCourses}
              onSelectCourse={selectCourseFromDb}
            />
            
            <div className="mt-6 border-t pt-4">
              <Button 
                onClick={() => setIsAdding(true)} 
                variant="outline" 
                className="w-full"
              >
                직접 과목 추가하기
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CourseSelector;
