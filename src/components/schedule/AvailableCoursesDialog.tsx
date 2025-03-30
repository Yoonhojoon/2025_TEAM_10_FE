import React, { useState, useEffect } from "react";
import { AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { parseScheduleTime } from "@/hooks/useSchedule";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface AvailableCourse {
  course_id: string;
  course_name: string;
  course_code: string;
  credit: number;
  schedule_time: string;
  classroom: string;
  category: string;
}

interface AvailableCoursesDialogProps {
  onAddCourse: (course: any) => boolean;
  onClose?: () => void;
}

const AvailableCoursesDialog: React.FC<AvailableCoursesDialogProps> = ({ onAddCourse, onClose }) => {
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<AvailableCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id);
          
        if (enrollmentsError) throw enrollmentsError;
        
        const enrolledCourseIds = enrollments.map(e => e.course_id);
        
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
          
        if (coursesError) throw coursesError;
        
        const availableCoursesData = coursesData.filter(
          course => !enrolledCourseIds.includes(course.course_id)
        );
        
        setAvailableCourses(availableCoursesData);
        setFilteredCourses(availableCoursesData);
      } catch (error) {
        console.error("Error fetching available courses:", error);
        toast({
          title: "데이터 로딩 오류",
          description: "과목 목록을 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableCourses();
  }, [user, toast]);
  
  useEffect(() => {
    filterCourses();
  }, [searchTerm, categoryFilter, availableCourses]);
  
  const filterCourses = () => {
    let filtered = [...availableCourses];
    
    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.course_name.toLowerCase().includes(lowerSearchTerm) || 
        course.course_code.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }
    
    setFilteredCourses(filtered);
  };
  
  const handleAddCourse = (course: AvailableCourse) => {
    const timeSlots = parseScheduleTime(course.schedule_time);
    
    if (timeSlots.length === 0) {
      const added = onAddCourse({
        id: course.course_id,
        name: course.course_name,
        code: course.course_code,
        credit: course.credit,
        day: "mon",
        startTime: "10:00",
        endTime: "12:00",
        location: course.classroom || "미정",
        schedule_time: course.schedule_time
      });
      
      if (added) {
        toast({
          title: "과목 추가 완료",
          description: `${course.course_name} 과목이 시간표에 추가되었습니다.`,
        });
      }
    } else {
      const firstSlot = timeSlots[0];
      const added = onAddCourse({
        id: course.course_id,
        name: course.course_name,
        code: course.course_code,
        credit: course.credit,
        day: firstSlot.day,
        startTime: firstSlot.startTime,
        endTime: firstSlot.endTime,
        location: course.classroom || "미정",
        schedule_time: course.schedule_time
      });
      
      if (added) {
        toast({
          title: "과목 추가 완료",
          description: `${course.course_name} 과목이 시간표에 추가되었습니다.`,
        });
      }
    }
  };
  
  const mapCategoryLabel = (category: string): string => {
    switch (category) {
      case "전공필수": return "전공 필수";
      case "전공기초": return "전공 기초";
      case "전공선택": return "전공 선택";
      case "배분이수교과": return "배분 이수";
      case "자유이수교과": return "자유 이수";
      default: return "일반 선택";
    }
  };

  const categoryOptions = [
    { value: "all", label: "전체 카테고리" },
    { value: "전공필수", label: "전공 필수" },
    { value: "전공기초", label: "전공 기초" },
    { value: "전공선택", label: "전공 선택" },
    { value: "배분이수교과", label: "배분 이수" },
    { value: "자유이수교과", label: "자유 이수" }
  ];
  
  return (
    <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
      <AlertDialogHeader className="flex flex-row items-center justify-between">
        <div>
          <AlertDialogTitle>수강 가능한 과목 목록</AlertDialogTitle>
          <AlertDialogDescription>
            아직 수강하지 않은 과목을 시간표에 추가합니다.
          </AlertDialogDescription>
        </div>
        <AlertDialogCancel className="h-9 w-9 p-0">
          <X className="h-4 w-4" />
        </AlertDialogCancel>
      </AlertDialogHeader>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center flex-1">
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="과목명 또는 학수번호로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div 
                  key={course.course_id} 
                  className="p-4 border rounded-md flex justify-between items-center hover:bg-accent/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{course.course_name}</span>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                        {mapCategoryLabel(course.category)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{course.course_code} · {course.credit}학점</div>
                    {course.schedule_time && (
                      <div className="text-sm mt-1">{course.schedule_time}</div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleAddCourse(course)}
                    title="시간표에 추가"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AlertDialogContent>
  );
};

export default AvailableCoursesDialog;
