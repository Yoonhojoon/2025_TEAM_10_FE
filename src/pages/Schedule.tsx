import React, { useMemo, useState, useEffect } from "react";
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
import ShareScheduleDialog from "@/components/schedule/ShareScheduleDialog";
import { GraduationCap, BookPlus, Save, Share, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import GraduationRequirementsModal from "@/components/dashboard/GraduationRequirementsModal";
import { TimeConflict, CourseCategory } from "@/types/schedule";
import CategorySelectionModal from "@/components/schedule/CategorySelectionModal";
import { getSharedScheduleFromUrl } from "@/utils/shareScheduleUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

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
    enrolledCourseIds,
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
    handleDeleteSchedule,
    setCourses
  } = useSchedule();
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>(["전공필수", "전공선택", "전공기초"]);
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasScheduleParam = urlParams.has('schedule');
    
    if (hasScheduleParam) {
      setIsViewOnlyMode(true);
      const sharedSchedule = getSharedScheduleFromUrl();
      
      if (sharedSchedule && sharedSchedule.length > 0) {
        setCourses(sharedSchedule);
        toast({
          title: "공유된 시간표",
          description: "현재 공유된 시간표를 보고 있습니다. 수정 및 저장이 불가능합니다."
        });
      } else {
        toast({
          title: "잘못된 시간표 링크",
          description: "공유된 시간표 정보를 불러올 수 없습니다.",
          variant: "destructive"
        });
      }
    }
  }, [setCourses, toast]);
  
  const currentSchedule = {
    name: isViewOnlyMode ? "공유된 시간표" : "현재 시간표",
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

  const handleGenerateWithCategories = async (): Promise<void> => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "시간표 생성을 위해 로그인이 필요합니다.",
        variant: "destructive"
      });
      return Promise.resolve();
    }
    
    setIsCategoryModalOpen(true);
    return Promise.resolve();
  };

  const handleCategoriesSelected = (categories: CourseCategory[]) => {
    setSelectedCategories(categories);
    handleGenerateSchedules(categories);
  };

  const canEdit = user && !isViewOnlyMode;

  const handleAddCourseWrapper = async (course: any) => {
    const result = await handleAddCourse(course);
    return result;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          {isViewOnlyMode ? (
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">공유된 시간표</h2>
                <p className="text-muted-foreground">공유된 시간표는 보기만 가능합니다. 수정 및 저장이 불가능합니다.</p>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">보기 전용 모드</span>
              </div>
            </div>
          ) : (
            <ScheduleHeader 
              isGeneratingSchedules={isGeneratingSchedules}
              handleGenerateSchedules={handleGenerateWithCategories}
              savedSchedules={savedSchedules}
              selectedSavedSchedule={selectedSavedSchedule}
              handleViewSchedule={handleViewSchedule}
              handleViewOtherSchedules={handleViewOtherSchedules}
            />
          )}
          
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>2024년 1학기 시간표</CardTitle>
                  <CardDescription>총 {consolidatedCourses.length}과목 {totalCredits}학점</CardDescription>
                </div>
                {!isViewOnlyMode && user ? (
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsShareDialogOpen(true)} 
                      variant="outline"
                      size="sm"
                      className="flex gap-2"
                      disabled={courses.length === 0}
                    >
                      <Share size={16} />
                      시간표 공유
                    </Button>
                  
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
                        onAddCourse={handleAddCourseWrapper}
                      />
                    </AlertDialog>
                  </div>
                ) : !isViewOnlyMode ? (
                  <div>
                    <p className="text-sm text-muted-foreground">기능을 모두 사용하시려면 로그인하세요</p>
                  </div>
                ) : null}
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
                      onDeleteCourse={canEdit ? handleDeleteCourse : undefined}
                      readOnly={isViewOnlyMode || !user}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {user && !isViewOnlyMode && (
        <>
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
          
          <ShareScheduleDialog
            isOpen={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
            courses={courses}
          />
        </>
      )}
    </div>
  );
};

export default Schedule;
