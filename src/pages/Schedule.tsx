import React from "react";
import { useSchedule } from "@/hooks/useSchedule";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import GeneratedSchedulesDialog from "@/components/schedule/GeneratedSchedulesDialog";
import SavedSchedulesDialog from "@/components/schedule/SavedSchedulesDialog";
import ScheduleVisualizer from "@/components/schedule/ScheduleVisualizer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Trash2, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import GraduationRequirementsModal from "@/components/dashboard/GraduationRequirementsModal";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CourseHistoryInput from "@/components/courses/CourseHistoryInput";

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
      schedule_time: `${course.day === 'mon' ? '월' : 
                      course.day === 'tue' ? '화' : 
                      course.day === 'wed' ? '수' : 
                      course.day === 'thu' ? '목' : '금'} ${course.startTime}-${course.endTime}`,
      classroom: course.location
    }))
  };

  const totalCredits = courses.reduce((total, course) => total + course.credit, 0);
  
  const handleApplyAndShowSaved = (schedule: any) => {
    applySchedule(schedule);
    setIsScheduleDialogOpen(false);
    setIsViewingSchedules(true);
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
                  <CardDescription>총 {totalCredits}학점</CardDescription>
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
                        <BookOpen size={16} />
                        수강 기록에서 추가
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>수강 기록에서 과목 추가</AlertDialogTitle>
                        <AlertDialogDescription>
                          이전에 수강했던, 또는 현재 수강중인 과목을 시간표에 추가합니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="mt-4">
                        <CourseHistoryInput onAddCourse={handleAddCourse} />
                      </div>
                    </AlertDialogContent>
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
                    {courses.map(course => (
                      <div 
                        key={course.id} 
                        className="p-3 rounded-lg border"
                        style={{ 
                          borderLeftColor: getCourseColor(course.code), 
                          borderLeftWidth: '4px',
                          backgroundColor: course.fromHistory ? 'rgba(253, 242, 248, 0.3)' : undefined
                        }}
                      >
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {getDayLabel(course.day)} {course.startTime}-{course.endTime}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">{course.credit}학점</span>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
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
