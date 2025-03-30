
import React, { useMemo } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import GeneratedSchedulesDialog from "@/components/schedule/GeneratedSchedulesDialog";
import SavedSchedulesDialog from "@/components/schedule/SavedSchedulesDialog";
import ScheduleVisualizer from "@/components/schedule/ScheduleVisualizer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Trash2, GraduationCap, BookPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GraduationRequirementsModal from "@/components/dashboard/GraduationRequirementsModal";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AvailableCoursesDialog from "@/components/schedule/AvailableCoursesDialog";

const Schedule = () => {
  const {
    courses,
    isGeneratingSchedules,
    generatedSchedules,
    isScheduleDialogOpen,
    isViewingSchedules,
    savedSchedules,
    selectedSavedSchedule,
    setIsScheduleDialogOpen,
    setIsViewingSchedules,
    setSelectedSavedSchedule,
    handleDeleteCourse,
    handleGenerateSchedules,
    applySchedule,
    handleViewSchedule,
    handleViewOtherSchedules,
    handleAddCourse
  } = useSchedule();
  
  const currentSchedule = {
    name: "현재 시간표",
    courses: courses.map(course => ({
      course_id: course.id,
      course_name: course.name,
      course_code: course.code,
      credit: course.credit,
      schedule_time: course.schedule_time || `${course.day === 'mon' ? '월' : 
                      course.day === 'tue' ? '화' : 
                      course.day === 'wed' ? '수' : 
                      course.day === 'thu' ? '목' : '금'} ${course.startTime}-${course.endTime}`,
      classroom: course.location
    }))
  };

  // Consolidate courses with the same code into a single entry
  const consolidatedCourses = useMemo(() => {
    const courseMap = new Map();
    
    courses.forEach(course => {
      if (courseMap.has(course.code)) {
        // Course already exists in the map
        const existingCourse = courseMap.get(course.code);
        // Add the day and time to the existing course
        existingCourse.scheduleTimes.push({
          id: course.id,
          day: course.day,
          startTime: course.startTime,
          endTime: course.endTime
        });
      } else {
        // New course, add to map
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
    
    // Return the values from the map
    return Array.from(courseMap.values());
  }, [courses]);

  const totalCredits = courses.reduce((total, course) => {
    // Only count each course credit once based on the code
    const courseCodes = new Set();
    if (!courseCodes.has(course.code)) {
      courseCodes.add(course.code);
      return total + course.credit;
    }
    return total;
  }, 0);
  
  const handleApplyAndShowSaved = (schedule: any) => {
    applySchedule(schedule);
    setIsScheduleDialogOpen(false);
  };

  const handleCloseAvailableCoursesDialog = () => {
    // The dialog is automatically closed when using the AlertDialog component
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <ScheduleHeader 
            isGeneratingSchedules={isGeneratingSchedules}
            handleGenerateSchedules={handleGenerateSchedules}
            savedSchedules={savedSchedules}
            selectedSavedSchedule={selectedSavedSchedule}
            handleViewSchedule={handleViewSchedule}
            handleViewOtherSchedules={handleViewOtherSchedules}
          />
          
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>2024년 1학기 시간표</CardTitle>
                  <CardDescription>총 {consolidatedCourses.length}과목 {totalCredits}학점</CardDescription>
                </div>
                <div className="flex gap-3">
                  <GraduationRequirementsModal>
                    <Button variant="outline" size="sm" className="flex gap-2">
                      <GraduationCap size={16} />
                      졸업 요건 확인
                    </Button>
                  </GraduationRequirementsModal>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex gap-2">
                        <BookPlus size={16} />
                        수강 가능한 과목 추가
                      </Button>
                    </AlertDialogTrigger>
                    <AvailableCoursesDialog 
                      onAddCourse={handleAddCourse}
                      onClose={handleCloseAvailableCoursesDialog}
                    />
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ScheduleVisualizer schedule={currentSchedule} />
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">등록된 과목 목록</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {consolidatedCourses.map(course => (
                      <div 
                        key={course.code} 
                        className="p-3 rounded-lg border"
                        style={{ 
                          borderLeftColor: getCourseColor(course.code), 
                          borderLeftWidth: '4px',
                          backgroundColor: course.fromHistory ? 'rgba(253, 242, 248, 0.3)' : undefined
                        }}
                      >
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {course.scheduleTimes.map((time, idx) => (
                            <div key={time.id} className="flex justify-between">
                              <span>{getDayLabel(time.day)} {time.startTime}-{time.endTime}</span>
                              <button
                                onClick={() => handleDeleteCourse(time.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm">{course.credit}학점</div>
                      </div>
                    ))}
                    {consolidatedCourses.length === 0 && (
                      <div className="md:col-span-3 p-6 text-center text-muted-foreground border rounded-lg">
                        아직 등록된 과목이 없습니다. '다른 계획 보기' 또는 '시간표 생성하기'를 이용해보세요.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <GeneratedSchedulesDialog
        isOpen={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        generatedSchedules={generatedSchedules}
        isGeneratingSchedules={isGeneratingSchedules}
        onApplySchedule={handleApplyAndShowSaved}
      />
      
      <SavedSchedulesDialog
        isOpen={isViewingSchedules}
        onOpenChange={setIsViewingSchedules}
        savedSchedules={savedSchedules}
        onApplySchedule={applySchedule}
        onSelectSchedule={setSelectedSavedSchedule}
      />
    </div>
  );
};

const getDayLabel = (day: string): string => {
  const dayLabels: Record<string, string> = {
    "mon": "월요일",
    "tue": "화요일",
    "wed": "수요일",
    "thu": "목요일",
    "fri": "금요일",
  };
  return dayLabels[day] || day;
};

const getCourseColor = (courseCode: string): string => {
  const seed = courseCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = seed % 360;
  return `hsla(${hue}, 70%, 85%, 0.8)`;
};

export default Schedule;
