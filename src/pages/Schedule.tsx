
import SchedulePlanner from "@/components/schedule/SchedulePlanner";
import GraduationRequirements from "@/components/schedule/GraduationRequirements";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Tag, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Json } from "@/integrations/supabase/types";

interface ScheduleCourse {
  id: string;
  name: string;
  code: string;
  day: "mon" | "tue" | "wed" | "thu" | "fri";
  startTime: string;
  endTime: string;
  location: string;
  credit: number;
  fromHistory?: boolean; // Add flag to identify courses from history
}

// Helper function to map database schedule time to app format
const parseScheduleTime = (scheduleTime: string): { 
  day: "mon" | "tue" | "wed" | "thu" | "fri", 
  startTime: string, 
  endTime: string 
} | null => {
  try {
    // Example format: "MON 10:00-12:00"
    const parts = scheduleTime.split(' ');
    if (parts.length !== 2) return null;
    
    const dayStr = parts[0].toLowerCase();
    const timeRange = parts[1].split('-');
    if (timeRange.length !== 2) return null;
    
    let day: "mon" | "tue" | "wed" | "thu" | "fri";
    switch (dayStr) {
      case 'mon': day = 'mon'; break;
      case 'tue': day = 'tue'; break;
      case 'wed': day = 'wed'; break;
      case 'thu': day = 'thu'; break;
      case 'fri': day = 'fri'; break;
      default: return null;
    }
    
    return {
      day,
      startTime: timeRange[0],
      endTime: timeRange[1]
    };
  } catch (error) {
    console.error("Error parsing schedule time:", error);
    return null;
  }
};

// Mock data for courses - Deliberately creating problematic schedule 
// to demonstrate error cases
const initialCourses: ScheduleCourse[] = [
  {
    id: uuidv4(),
    name: "컴퓨터 네트워크",
    code: "COMEENG301",
    day: "mon",
    startTime: "10:00",
    endTime: "12:00",
    location: "공학관 401호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "데이터베이스",
    code: "COMEENG302",
    day: "wed",
    startTime: "13:00",
    endTime: "15:00",
    location: "정보관 202호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "알고리즘",
    code: "COMEENG303",
    day: "thu",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 305호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "운영체제",
    code: "COMEENG304",
    day: "tue",
    startTime: "10:00",
    endTime: "12:00",
    location: "공학관 505호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "인공지능",
    code: "COMEENG401",
    day: "mon",
    startTime: "13:00",
    endTime: "15:00",
    location: "공학관 605호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "머신러닝",
    code: "COMEENG402",
    day: "mon",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 606호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "딥러닝",
    code: "COMEENG403",
    day: "mon",
    startTime: "17:00",
    endTime: "19:00",
    location: "공학관 607호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "캡스톤디자인",
    code: "COMEENG501",
    day: "fri",
    startTime: "10:00",
    endTime: "13:00",
    location: "공학관 701호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "IoT 프로그래밍",
    code: "COMEENG502",
    day: "wed",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 702호",
    credit: 3
  }
];

interface GeneratedSchedule {
  name: string;
  태그?: string[];
  과목들?: {
    course_id: string;
    과목_이름: string;
    학수번호: string;
    학점: number;
    강의_시간: string;
    강의실: string;
  }[];
  courses?: {
    course_id: string;
    course_name: string;
    course_code: string;
    credit: number;
    schedule_time: string;
    classroom: string;
  }[];
  총_학점?: number;
  total_credits?: number;
  설명?: string;
  description?: string;
}

// Update the SavedSchedule interface to be compatible with Supabase's Json type
interface SavedSchedule {
  schedule_id: string;
  created_at: string;
  description_tags: string[] | null;
  schedule_json: GeneratedSchedule;
  user_id?: string; // Added for completeness but might not be used in UI
}

const Schedule = () => {
  const [courses, setCourses] = useState<ScheduleCourse[]>(initialCourses);
  const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false);
  const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedSchedule[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<GeneratedSchedule | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [isViewingSchedules, setIsViewingSchedules] = useState(false);
  const [selectedSavedSchedule, setSelectedSavedSchedule] = useState<string | null>(null);
  
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
          // Cast the Json data to GeneratedSchedule
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
  }, [user, toast]);
  
  const handleAddCourse = (course: Omit<ScheduleCourse, "id">) => {
    const newCourse = {
      id: uuidv4(),
      ...course
    };
    setCourses([...courses, newCourse]);
  };
  
  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };
  
  const handleGenerateSchedules = async () => {
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
      
      const { data, error } = await supabase.functions.invoke('generate-schedules', {
        body: {
          userId: user.id,
          takenCourseIds
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
          description: `${data.schedules.length}개의 시간표가 생성되었습니다.`
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
    
    coursesList.forEach(course => {
      const courseName = "과목_이름" in course ? course.과목_이름 : course.course_name;
      const courseCode = "학수번호" in course ? course.학수번호 : course.course_code;
      const credit = "학점" in course ? course.학점 : course.credit;
      const scheduleTime = "강의_시간" in course ? course.강의_시간 : course.schedule_time;
      const classroom = "강의실" in course ? course.강의실 : course.classroom || "미정";
      
      const timeInfo = parseScheduleTime(scheduleTime);
      
      if (timeInfo) {
        newCourses.push({
          id: uuidv4(),
          name: courseName,
          code: courseCode,
          day: timeInfo.day,
          startTime: timeInfo.startTime,
          endTime: timeInfo.endTime,
          location: classroom,
          credit: credit,
          fromHistory: false
        });
      }
    });
    
    if (newCourses.length > 0) {
      setCourses(newCourses);
      setIsScheduleDialogOpen(false);
      
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">시간표 계획</h1>
            <p className="text-muted-foreground">
              다음 학기 수강 계획을 세우고 최적의 시간표를 만드세요.
            </p>
          </div>
          
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Button 
              onClick={handleGenerateSchedules} 
              disabled={isGeneratingSchedules}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isGeneratingSchedules ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  시간표 생성 중...
                </>
              ) : (
                <>추천 시간표 생성하기</>
              )}
            </Button>
            
            {savedSchedules.length > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedSavedSchedule || ""}
                  onValueChange={handleViewSchedule}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="저장된 시간표 보기" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedSchedules.map((schedule) => (
                      <SelectItem 
                        key={schedule.schedule_id} 
                        value={schedule.schedule_id}
                      >
                        {schedule.schedule_json.name}
                        {schedule.description_tags && schedule.description_tags.length > 0 && 
                          ` (${schedule.description_tags.join(', ')})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={handleViewOtherSchedules}
                  title="저장된 시간표 목록 보기"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="w-full lg:w-3/5">
              <SchedulePlanner 
                courses={courses}
                onAddCourse={handleAddCourse}
                onDeleteCourse={handleDeleteCourse}
                onViewOtherSchedules={handleViewOtherSchedules}
              />
            </div>
            
            <div className="w-full lg:w-2/5">
              <GraduationRequirements />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>추천 시간표</DialogTitle>
            <DialogDescription>
              AI가 생성한 추천 시간표입니다. 확인하고 필요한 시간표를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="option1" className="mt-4">
            <TabsList className="grid grid-cols-3">
              {generatedSchedules.map((schedule, index) => (
                <TabsTrigger key={index} value={`option${index + 1}`}>
                  {schedule.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {generatedSchedules.map((schedule, index) => (
              <TabsContent key={index} value={`option${index + 1}`}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      총 {schedule.총_학점 || schedule.total_credits}학점
                    </h3>
                    {schedule.태그 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {schedule.태그.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-muted-foreground mt-1">
                      {schedule.설명 || schedule.description}
                    </p>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left">과목 코드</th>
                          <th className="px-4 py-2 text-left">과목명</th>
                          <th className="px-4 py-2 text-left">학점</th>
                          <th className="px-4 py-2 text-left">시간</th>
                          <th className="px-4 py-2 text-left">강의실</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(schedule.과목들 || schedule.courses || []).map((course, courseIndex) => {
                          const courseName = "과목_이름" in course ? course.과목_이름 : course.course_name;
                          const courseCode = "학수번호" in course ? course.학수번호 : course.course_code;
                          const credit = "학점" in course ? course.학점 : course.credit;
                          const scheduleTime = "강의_시간" in course ? course.강의_시간 : course.schedule_time;
                          const classroom = "강의실" in course ? course.강의실 : course.classroom;
                          
                          return (
                            <tr key={courseIndex} className="border-t">
                              <td className="px-4 py-2">{courseCode}</td>
                              <td className="px-4 py-2 font-medium">{courseName}</td>
                              <td className="px-4 py-2">{credit}학점</td>
                              <td className="px-4 py-2">{scheduleTime}</td>
                              <td className="px-4 py-2">{classroom || "미정"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => applySchedule(schedule)}>
                      이 시간표 보기
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewingSchedules} onOpenChange={setIsViewingSchedules}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>저장된 시간표</DialogTitle>
            <DialogDescription>
              이전에 저장한 시간표 목록입니다. 적용할 시간표를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          
          {savedSchedules.length > 0 ? (
            <div className="space-y-6 mt-4">
              {savedSchedules.map((schedule) => (
                <div 
                  key={schedule.schedule_id} 
                  className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{schedule.schedule_json.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        생성일: {new Date(schedule.created_at).toLocaleDateString()}
                      </div>
                      {schedule.description_tags && schedule.description_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {schedule.description_tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm mt-2">
                        총 {schedule.schedule_json.총_학점 || schedule.schedule_json.total_credits}학점
                      </p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => {
                        applySchedule(schedule.schedule_json);
                        setSelectedSavedSchedule(schedule.schedule_id);
                        setIsViewingSchedules(false);
                      }}
                    >
                      적용하기
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-sm">
                    {schedule.schedule_json.설명 || schedule.schedule_json.description || "설명 없음"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              아직 저장된 시간표가 없습니다. 시간표를 생성하고 저장해보세요.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
