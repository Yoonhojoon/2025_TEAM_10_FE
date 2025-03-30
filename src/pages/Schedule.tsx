
import React from "react";
import { useSchedule } from "@/hooks/useSchedule";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import GeneratedSchedulesDialog from "@/components/schedule/GeneratedSchedulesDialog";
import SavedSchedulesDialog from "@/components/schedule/SavedSchedulesDialog";
import ScheduleVisualizer from "@/components/schedule/ScheduleVisualizer";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { Trash2 } from "lucide-react";

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
    handleViewOtherSchedules
  } = useSchedule();
  
  // Create a schedule object from current courses for visualization
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

  // Calculate total credits
  const totalCredits = courses.reduce((total, course) => total + course.credit, 0);
  
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
              </CardHeader>
              <CardContent>
                {/* Schedule Visualizer */}
                <div className="mb-6">
                  <ScheduleVisualizer schedule={currentSchedule} />
                </div>
                
                {/* Course List */}
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
        onApplySchedule={applySchedule}
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

// Helper functions for course display
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
