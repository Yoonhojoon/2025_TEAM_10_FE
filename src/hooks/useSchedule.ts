
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Json } from "@/integrations/supabase/types";
import { 
  ScheduleCourse, 
  GeneratedSchedule, 
  SavedSchedule, 
  ConsolidatedCourse, 
  CourseData 
} from "@/types/schedule";
import { parseScheduleTime, formatScheduleTime, getKoreanDayAbbreviation } from "@/utils/scheduleUtils";

export const useSchedule = () => {
  const [courses, setCourses] = useState<ScheduleCourse[]>([]);
  const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false);
  const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedSchedule[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isViewingSchedules, setIsViewingSchedules] = useState(false);
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [selectedSavedSchedule, setSelectedSavedSchedule] = useState<string | null>(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSavedSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const typedSchedules: SavedSchedule[] = data.map(item => ({
            ...item,
            schedule_json: item.schedule_json as unknown as GeneratedSchedule
          }));
          
          setSavedSchedules(typedSchedules);
          console.log('Fetched saved schedules:', typedSchedules);
        }
      } catch (error) {
        console.error('Error fetching saved schedules:', error);
        toast({
          title: "저장된 시간표 불러오기 실패",
          description: "저장된 시간표를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
      }
    };
    
    fetchSavedSchedules();
    fetchEnrolledCourses();
  }, [user, toast]);
  
  const fetchEnrolledCourses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const courseIds = data.map(item => item.course_id);
        setEnrolledCourseIds(courseIds);
        console.log('Fetched enrolled course IDs:', courseIds);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };
  
  const checkPrerequisites = async (courseCode: string) => {
    try {
      // First get the course_id from the course code
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('course_id')
        .eq('course_code', courseCode)
        .single();
        
      if (courseError || !courseData) {
        console.error('Error fetching course ID:', courseError);
        return { hasAllPrerequisites: true, missingPrerequisites: [] };
      }
      
      // Now get the prerequisites for this course with proper column aliasing
      const { data: prerequisites, error: prereqError } = await supabase
        .from('prerequisites')
        .select(`
          prerequisite_course_id,
          prerequisite_courses:courses!prerequisites_prerequisite_course_id_fkey (
            course_name,
            course_code
          )
        `)
        .eq('course_id', courseData.course_id);
        
      if (prereqError) {
        console.error('Error fetching prerequisites:', prereqError);
        return { hasAllPrerequisites: true, missingPrerequisites: [] };
      }
      
      if (!prerequisites || prerequisites.length === 0) {
        // No prerequisites for this course
        return { hasAllPrerequisites: true, missingPrerequisites: [] };
      }
      
      // Check if the user has taken all prerequisites
      const missingPrerequisites = prerequisites.filter(
        prereq => !enrolledCourseIds.includes(prereq.prerequisite_course_id)
      ).map(prereq => prereq.prerequisite_courses);
      
      return {
        hasAllPrerequisites: missingPrerequisites.length === 0,
        missingPrerequisites
      };
    } catch (error) {
      console.error('Error checking prerequisites:', error);
      return { hasAllPrerequisites: true, missingPrerequisites: [] };
    }
  };
  
  const handleAddCourse = async (course: Omit<ScheduleCourse, "id">) => {
    if (user) {
      const { hasAllPrerequisites, missingPrerequisites } = await checkPrerequisites(course.code);
      
      if (!hasAllPrerequisites && missingPrerequisites.length > 0) {
        const missingCourseNames = missingPrerequisites.map(c => `${c.course_name} (${c.course_code})`).join(', ');
        
        toast({
          title: "선수과목 미이수",
          description: `이 과목을 수강하기 위해서는 다음 선수과목을 이수해야 합니다: ${missingCourseNames}`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    const courseExists = courses.some(existingCourse => existingCourse.code === course.code);
    
    if (courseExists) {
      toast({
        title: "과목 추가 실패",
        description: "이미 시간표에 있는 과목입니다. 동일 과목은 추가할 수 없습니다.",
        variant: "destructive"
      });
      return false;
    }
    
    const newCourse = {
      id: uuidv4(),
      ...course
    };
    setCourses([...courses, newCourse]);
    return true;
  };
  
  const handleDeleteCourse = (id: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "과목 삭제를 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    
    setCourses(courses.filter(course => course.id !== id));
  };
  
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "시간표 삭제를 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeletingSchedule(true);
    
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('schedule_id', scheduleId)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setSavedSchedules(savedSchedules.filter(schedule => schedule.schedule_id !== scheduleId));
      
      if (selectedSavedSchedule === scheduleId) {
        setSelectedSavedSchedule(null);
      }
      
      toast({
        title: "시간표 삭제 완료",
        description: "시간표가 성공적으로 삭제되었습니다."
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "시간표 삭제 실패",
        description: error instanceof Error ? error.message : "시간표를 삭제하는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingSchedule(false);
    }
  };
  
  const handleGenerateSchedules = async (categories?: string[]) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "시간표 생성을 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingSchedules(true);
    
    try {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
        
      if (enrollmentsError) {
        throw new Error('수강 내역을 불러오는데 실패했습니다.');
      }
      
      const takenCourseIds = enrollments.map(enrollment => enrollment.course_id);
      console.log("Sending taken course IDs to Edge Function:", takenCourseIds);
      console.log("Sending enrolled course IDs to Edge Function:", enrolledCourseIds);
      
      const courseCategories = categories || ["전공필수", "전공선택", "전공기초"];
      
      const { data, error } = await supabase.functions.invoke('generate-schedules', {
        body: {
          userId: user.id,
          takenCourseIds,
          categories: courseCategories,
          courseOverlapCheckPriority: true,
          enrolledCourseIds // Pass enrolled course IDs to check prerequisites
        }
      });
      
      if (error) {
        throw new Error('시간표 생성에 실패했습니다.');
      }
      
      console.log('Generated schedules data:', data);
      
      if (data && data.schedules && data.schedules.length > 0) {
        setGeneratedSchedules(data.schedules);
        setIsScheduleDialogOpen(true);
        toast({
          title: "시간표 생성 완료",
          description: `${data.schedules.length}개의 시간표가 생성되었습니다. 총 ${data.coursesConsidered || '?'}개 과목 중에서 선택되었습니다.`,
        });
      } else {
        toast({
          title: "시간표 생성 결과",
          description: data.message || "생성할 수 있는 시간표가 없습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating schedules:', error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "시간표 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSchedules(false);
    }
  };
  
  const applySchedule = (schedule: GeneratedSchedule) => {
    const newCourses: ScheduleCourse[] = [];
    
    const coursesList = schedule.과목들 || schedule.courses || [];
    
    console.log("Applying schedule:", schedule);
    console.log("Courses to process:", coursesList);
    
    coursesList.forEach(course => {
      const courseName = "과목_이름" in course && course.과목_이름 ? course.과목_이름 : 
                        "course_name" in course && course.course_name ? course.course_name : "";
      const courseCode = "학수번호" in course && course.학수번호 ? course.학수번호 : 
                        "course_code" in course && course.course_code ? course.course_code : "";
      const credit = "학점" in course && course.학점 ? course.학점 : 
                    "credit" in course && course.credit ? course.credit : 0;
      const scheduleTime = "강의_시간" in course && course.강의_시간 ? course.강의_시간 : 
                          "schedule_time" in course && course.schedule_time ? course.schedule_time : "";
      const classroom = "강의실" in course && course.강의실 ? course.강의실 : 
                       "classroom" in course && course.classroom ? course.classroom : "미정";
      
      if (!courseName || !courseCode || !scheduleTime) {
        console.error("Missing required course data:", course);
        return;
      }
      
      console.log("Processing course:", courseName, "with time:", scheduleTime);
      
      const timeInfoArray = parseScheduleTime(scheduleTime);
      console.log("Parsed time info array:", timeInfoArray);
      
      if (timeInfoArray && timeInfoArray.length > 0) {
        timeInfoArray.forEach(timeInfo => {
          newCourses.push({
            id: uuidv4(),
            name: courseName,
            code: courseCode,
            day: timeInfo.day,
            startTime: timeInfo.startTime,
            endTime: timeInfo.endTime,
            location: classroom,
            credit: credit,
            fromHistory: false,
            schedule_time: scheduleTime
          });
        });
      } else {
        console.error("Failed to parse schedule time for course:", courseName, scheduleTime);
      }
    });
    
    console.log("Processed courses:", newCourses);
    
    if (newCourses.length > 0) {
      setCourses(newCourses);
      setIsScheduleDialogOpen(false);
      setIsViewingSchedules(false);
      
      toast({
        title: "시간표 적용 완료",
        description: `${schedule.name}이(가) 적용되었습니다.`
      });
    } else {
      toast({
        title: "시간표 적용 실패",
        description: "시간표 데이터를 변환하는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewSchedule = (scheduleId: string) => {
    const schedule = savedSchedules.find(s => s.schedule_id === scheduleId);
    if (schedule) {
      setSelectedSavedSchedule(scheduleId);
      applySchedule(schedule.schedule_json);
      
      toast({
        title: "시간표 적용",
        description: "저장된 시간표가 적용되었습니다."
      });
    }
  };
  
  const handleViewOtherSchedules = () => {
    if (savedSchedules.length === 0) {
      toast({
        title: "저장된 시간표 없음",
        description: "아직 저장된 시간표가 없습니다. 시간표를 생성하고 저장해보세요."
      });
      return;
    }
    
    setIsViewingSchedules(true);
  };
  
  const handleSaveSchedule = async (scheduleName: string, tags: string[] = []) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "시간표 저장을 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSavingSchedule(true);
    
    try {
      const uniqueCourses = new Map();
      courses.forEach(course => {
        if (!uniqueCourses.has(course.code)) {
          uniqueCourses.set(course.code, course);
        }
      });
      const totalCredits = Array.from(uniqueCourses.values()).reduce((sum, course) => sum + course.credit, 0);
      
      const coursesByCode = new Map();
      
      courses.forEach(course => {
        const dayKorean = getKoreanDayAbbreviation(course.day);
        const timeInfo = `${dayKorean} ${course.startTime}-${course.endTime}`;
        
        if (coursesByCode.has(course.code)) {
          const existingCourse = coursesByCode.get(course.code);
          existingCourse.schedules.push(timeInfo);
        } else {
          coursesByCode.set(course.code, {
            id: course.id,
            name: course.name,
            code: course.code,
            credit: course.credit,
            location: course.location,
            schedules: [timeInfo]
          });
        }
      });
      
      const schedule = {
        name: scheduleName,
        태그: tags,
        과목들: Array.from(coursesByCode.values()).map(course => ({
          course_id: course.id,
          과목_이름: course.name,
          학수번호: course.code,
          학점: course.credit,
          강의_시간: course.schedules.join(', '),
          강의실: course.location
        })),
        총_학점: totalCredits,
        설명: `${scheduleName} 시간표입니다.`
      };
      
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          user_id: user.id,
          schedule_json: schedule as unknown as Json,
          description_tags: tags.length > 0 ? tags : null
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const newSchedule: SavedSchedule = {
          ...data,
          schedule_json: data.schedule_json as unknown as GeneratedSchedule
        };
        
        setSavedSchedules([newSchedule, ...savedSchedules]);
        setSelectedSavedSchedule(newSchedule.schedule_id);
        
        toast({
          title: "시간표 저장 완료",
          description: `"${scheduleName}" 시간표가 저장되었습니다.`
        });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "시간표 저장 실패",
        description: error instanceof Error ? error.message : "시간표를 저장하는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const consolidatedCourses = useMemo(() => {
    const courseMap = new Map<string, ConsolidatedCourse>();
    
    courses.forEach(course => {
      if (courseMap.has(course.code)) {
        const existingCourse = courseMap.get(course.code)!;
        existingCourse.scheduleTimes.push({
          id: course.id,
          day: course.day,
          startTime: course.startTime,
          endTime: course.endTime
        });
      } else {
        courseMap.set(course.code, {
          ...course,
          scheduleTimes: [{
            id: course.id,
            day: course.day,
            startTime: course.startTime,
            endTime: course.endTime
          }]
        });
      }
    });
    
    return Array.from(courseMap.values());
  }, [courses]);

  const totalCredits = useMemo(() => {
    const courseCodes = new Set<string>();
    let total = 0;
    
    courses.forEach(course => {
      if (!courseCodes.has(course.code)) {
        courseCodes.add(course.code);
        total += course.credit;
      }
    });
    
    return total;
  }, [courses]);
  
  return {
    courses,
    consolidatedCourses,
    totalCredits,
    isGeneratingSchedules,
    generatedSchedules,
    isScheduleDialogOpen,
    isViewingSchedules,
    savedSchedules,
    selectedSavedSchedule,
    isSavingSchedule,
    isDeletingSchedule,
    enrolledCourseIds,
    setIsScheduleDialogOpen,
    setIsViewingSchedules,
    setSelectedSavedSchedule,
    handleAddCourse,
    handleDeleteCourse,
    handleGenerateSchedules,
    applySchedule,
    handleViewSchedule,
    handleViewOtherSchedules,
    handleSaveSchedule,
    handleDeleteSchedule,
    setCourses,
    checkPrerequisites
  };
};
