
import React, { useMemo, useState } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import GeneratedSchedulesDialog from "@/components/schedule/GeneratedSchedulesDialog";
import SavedSchedulesDialog from "@/components/schedule/SavedSchedulesDialog";
import ScheduleVisualizer from "@/components/schedule/ScheduleVisualizer";
import ScheduleView from "@/components/schedule/ScheduleView";
import TimeConflictWarning from "@/components/schedule/TimeConflictWarning";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/Card";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AvailableCoursesDialog from "@/components/schedule/AvailableCoursesDialog";
import SaveScheduleDialog from "@/components/schedule/SaveScheduleDialog";
import { GraduationCap, BookPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import GraduationRequirementsModal from "@/components/dashboard/GraduationRequirementsModal";
import { TimeConflict } from "@/types/schedule";
import CategorySelectionModal from "@/components/schedule/CategorySelectionModal";

const Schedule = () => {
  const {
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
    setIsScheduleDialogOpen,
    setIsViewingSchedules,
    setSelectedSavedSchedule,
    handleDeleteCourse,
    handleGenerateSchedules,
    applySchedule,
    handleViewSchedule,
    handleViewOtherSchedules,
    handleAddCourse,
    handleSaveSchedule,
    handleDeleteSchedule
  } = useSchedule();
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["전공필수", "전공선택", "전공기초"]);
  
  // Format current schedule for the visualizer
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

  // Detect time conflicts
  const timeConflicts = useMemo(() => {
    const conflicts: TimeConflict[] = [];
    
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const courseA = courses[i];
        const courseB = courses[j];
        
        if (courseA.day !== courseB.day) continue;
        
        const startA = parseInt(courseA.startTime.replace(':', ''));
        const endA = parseInt(courseA.endTime.replace(':', ''));
        const startB = parseInt(courseB.startTime.replace(':', ''));
        const endB = parseInt(courseB.endTime.replace(':', ''));
        
        if ((startA <= startB && endA > startB) || 
            (startB <= startA && endB > startA)) {
          conflicts.push({
            courseA: courseA.name,
            courseB: courseB.name,
            day: courseA.day,
            timeA: `${courseA.startTime}-${courseA.endTime}`,
            timeB: `${courseB.startTime}-${courseB.endTime}`
          });
        }
      }
    }
    
    return conflicts;
  }, [courses]);
  
  const handleApplyAndShowSaved = (schedule: any) => {
    applySchedule(schedule);
    setIsScheduleDialogOpen(false);
  };

  // Modified function to return Promise<void>
  const handleGenerateWithCategories = async (): Promise<void> => {
    setIsCategoryModalOpen(true);
    // Return a resolved promise to satisfy the type requirement
    return Promise.resolve();
  };

  const handleCategoriesSelected = (categories: string[]) => {
    setSelectedCategories(categories);
    handleGenerateSchedules(categories);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <ScheduleHeader 
            isGeneratingSchedules={isGeneratingSchedules}
            handleGenerateSchedules={handleGenerateWithCategories}
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
                  <Button 
                    onClick={() => setIsSaveDialogOpen(true)} 
                    variant="default"
                    size="sm"
                    className="flex gap-2"
                    disabled={courses.length === 0 || isSavingSchedule}
                  >
                    <Save size={16} />
                    시간표 저장
                  </Button>
                  
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
                    />
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <TimeConflictWarning conflicts={timeConflicts} />
                
                <div className="mb-6">
                  <ScheduleVisualizer schedule={currentSchedule} />
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">등록된 과목 목록</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ScheduleView 
                      courses={consolidatedCourses}
                      onDeleteCourse={handleDeleteCourse}
                    />
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
        onDeleteSchedule={handleDeleteSchedule}
        isDeletingSchedule={isDeletingSchedule}
      />
      
      <SaveScheduleDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveSchedule}
        isSaving={isSavingSchedule}
      />
      
      <CategorySelectionModal
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSelectCategories={handleCategoriesSelected}
      />
    </div>
  );
};

export default Schedule;
