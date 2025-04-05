import CourseHistoryInput from "@/components/courses/CourseHistoryInput";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { ScheduleCourse } from "@/types/schedule";

interface Course {
  id: string;
  code: string;
  name: string;
  category: "majorRequired" | "majorElective" | "generalRequired" | "generalElective";
  credit: number;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserEnrollments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            enrollment_id,
            course_id,
            courses (
              course_id,
              course_code,
              course_name,
              category,
              credit
            )
          `)
          .eq('user_id', user.id);
        
        if (enrollmentsError) throw enrollmentsError;
        
        if (enrollmentsData && enrollmentsData.length > 0) {
          console.log("Fetched enrollments:", enrollmentsData);
          
          const formattedCourses = enrollmentsData.map(enrollment => {
            const courseDetails = enrollment.courses;
            
            const mapCategory = (): "majorRequired" | "majorElective" | "generalRequired" | "generalElective" => {
              const category = courseDetails.category;
              if (category === "전공필수" || category === "전공기초") return "majorRequired";
              if (category === "전공선택") return "majorElective";
              if (category === "배분이수교과") return "generalRequired";
              return "generalElective";
            };
            
            return {
              id: enrollment.enrollment_id,
              code: courseDetails.course_code,
              name: courseDetails.course_name,
              category: mapCategory(),
              credit: courseDetails.credit
            };
          });
          
          setCourses(formattedCourses);
        } else {
          console.log("No enrollments found for user:", user.id);
        }
      } catch (error) {
        console.error("Error fetching user enrollments:", error);
        toast({
          title: "데이터 로딩 오류",
          description: "수강 기록을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserEnrollments();
  }, [user, toast]);
  
  const handleAddCourse = async (course: Omit<Course, "id">) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "과목을 추가하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    const isDuplicate = courses.some(existingCourse => existingCourse.code === course.code);
    if (isDuplicate) {
      toast({
        title: "과목 중복",
        description: "이미 추가된 과목입니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Adding course:", course);
      
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('course_id')
        .eq('course_code', course.code)
        .single();
      
      if (courseError) {
        console.error("Course lookup error:", courseError);
        throw courseError;
      }
      
      console.log("Found course ID:", courseData.course_id);
      
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseData.course_id
        })
        .select()
        .single();
      
      if (enrollmentError) {
        console.error("Enrollment error details:", enrollmentError);
        throw enrollmentError;
      }
      
      console.log("Enrollment successful:", enrollmentData);
      
      const newCourse = {
        id: enrollmentData.enrollment_id,
        ...course
      };
      setCourses([newCourse, ...courses]);
      
      toast({
        title: "과목 추가 완료",
        description: `${course.name} 과목이 추가되었습니다.`,
      });
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "과목 추가 오류",
        description: "과목을 추가하는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteCourse = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('enrollment_id', id);
      
      if (error) throw error;
      
      setCourses(courses.filter(course => course.id !== id));
      
      toast({
        title: "과목 삭제 완료",
        description: "선택한 과목이 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "과목 삭제 오류",
        description: "과목을 삭제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  const handleScheduleCourseAdd = (course: Omit<ScheduleCourse, "id">) => {
    const adaptedCourse: Omit<Course, "id"> = {
      code: course.code,
      name: course.name,
      credit: course.credit,
      category: "majorElective"
    };
    
    handleAddCourse(adaptedCourse);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">수강 기록</h1>
            <p className="text-muted-foreground">
              지금까지 수강한 과목을 관리하고 졸업 요건 충족 상황을 확인하세요.
            </p>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CourseHistoryInput 
              courses={courses}
              onAddCourse={handleScheduleCourseAdd}
              onDeleteCourse={handleDeleteCourse}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
