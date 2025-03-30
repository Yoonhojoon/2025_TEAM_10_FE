
import React from "react";
import { useSchedule } from "@/hooks/useSchedule";
import SchedulePlanner from "@/components/schedule/SchedulePlanner";
import GraduationRequirements from "@/components/schedule/GraduationRequirements";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import GeneratedSchedulesDialog from "@/components/schedule/GeneratedSchedulesDialog";
import SavedSchedulesDialog from "@/components/schedule/SavedSchedulesDialog";
import ScheduleVisualizer from "@/components/schedule/ScheduleVisualizer";

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
    handleAddCourse,
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
          
          <div className="flex flex-col lg:flex-row gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="w-full lg:w-3/5">
              <SchedulePlanner 
                courses={courses}
                onAddCourse={handleAddCourse}
                onDeleteCourse={handleDeleteCourse}
                onViewOtherSchedules={handleViewOtherSchedules}
              />
              
              {/* Always show the schedule visualizer, even when empty */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">시간표 시각화</h3>
                <ScheduleVisualizer schedule={currentSchedule} />
              </div>
            </div>
            
            <div className="w-full lg:w-2/5">
              <GraduationRequirements />
            </div>
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

export default Schedule;
