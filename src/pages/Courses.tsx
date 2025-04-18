
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
  category: "majorRequired" | "majorElective" | "generalRequired" | "generalElective" | "industryRequired";
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
            
            const mapCategory = (): "majorRequired" | "majorElective" | "generalRequired" | "generalElective" | "industryRequired" => {
              const category = courseDetails.category;
              if (category === "전공필수" || category === "전공기초") return "majorRequired";
              if (category === "전공선택") return "majorElective";
              if (category === "배분이수교과") return "generalRequired";
              if (category === "자유이수교과") return "generalElective";
              if (category === "산학필수") return "industryRequired";
              return "generalElective"; // Default case
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
      
      // 1. First, get the user's department to prioritize courses from their department
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('department_id')
        .eq('user_id', user.id)
        .single();
      
      if (userError) {
        console.error("Error fetching user department:", userError);
      }
      
      console.log("User department data:", userData);
      
      // 2. Look up the course with more specific criteria - first try to find an exact match with course_code AND user's department
      let query = supabase
        .from('courses')
        .select('course_id');
      
      // If we have user's department, prioritize that department's courses
      if (userData && userData.department_id) {
        query = query.eq('course_code', course.code)
                     .eq('department_id', userData.department_id);
      } else {
        // Without department info, just look by course code
        query = query.eq('course_code', course.code);
      }
        
      let { data: courseData, error: courseError } = await query.maybeSingle();
      
      // If we couldn't find by department, fall back to just course code
      if (!courseData && userData && userData.department_id) {
        console.log("Course not found in user's department, searching all departments");
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('courses')
          .select('course_id')
          .eq('course_code', course.code)
          .limit(1); // Just take the first match if multiple exist
          
        if (fallbackError) {
          console.error("Fallback course lookup error:", fallbackError);
        } else if (fallbackData && fallbackData.length > 0) {
          courseData = fallbackData[0];
          console.log("Found course in another department:", courseData);
        }
      }
      
      console.log("Course lookup result:", { courseData, courseError });
      
      if (courseError) {
        console.error("Course lookup error details:", courseError);
        throw courseError;
      }
      
      if (!courseData || !courseData.course_id) {
        console.error(`No course found with code: ${course.code}`);
        throw new Error(`과목 코드 ${course.code}에 해당하는 과목을 찾을 수 없습니다.`);
      }
      
      console.log("Found course ID:", courseData.course_id);
      
      // Adding enrollment
      console.log("Adding enrollment with:", {
        user_id: user.id,
        course_id: courseData.course_id
      });
      
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
        // More detailed error information
        if (enrollmentError.code === '23505') {
          throw new Error("이 과목을 이미 수강 중입니다. (중복 등록)");
        } else if (enrollmentError.message) {
          throw new Error(`등록 중 오류: ${enrollmentError.message}`);
        } else {
          throw enrollmentError;
        }
      }
      
      console.log("Enrollment successful, response data:", enrollmentData);
      
      if (!enrollmentData || !enrollmentData.enrollment_id) {
        console.error("Enrollment succeeded but no ID returned");
        throw new Error("등록은 성공했으나 등록 ID를 받지 못했습니다.");
      }
      
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
      let errorMessage = "과목을 추가하는 중 문제가 발생했습니다.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "과목 추가 오류",
        description: errorMessage,
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
