
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ScheduleVisualizer from "./ScheduleVisualizer";
import { GeneratedSchedule } from "@/types/schedule";

interface GeneratedSchedulesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generatedSchedules: GeneratedSchedule[];
  isGeneratingSchedules: boolean;
  onApplySchedule: (schedule: GeneratedSchedule) => void;
}

const GeneratedSchedulesDialog = ({
  isOpen,
  onOpenChange,
  generatedSchedules,
  isGeneratingSchedules,
  onApplySchedule
}: GeneratedSchedulesDialogProps) => {
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-6 md:p-8 w-[90vw]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl md:text-2xl">생성된 시간표</DialogTitle>
          <DialogDescription className="text-base mt-2">
            AI가 생성한 시간표 조합입니다. 원하는 시간표를 선택하세요.
          </DialogDescription>
        </DialogHeader>
        
        {isGeneratingSchedules ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
            <p className="text-center text-muted-foreground text-lg">시간표를 생성 중입니다. 잠시만 기다려주세요...</p>
          </div>
        ) : generatedSchedules.length > 0 ? (
          <div className="space-y-8 mt-4">
            {generatedSchedules.map((schedule, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-6 transition-colors ${selectedScheduleIndex === index ? 'bg-secondary/40 border-primary' : 'hover:bg-secondary/30'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-medium">{schedule.name}</h3>
                    {(schedule.태그 || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {schedule.태그?.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-base mt-3">
                      총 {schedule.총_학점 || schedule.total_credits}학점
                    </p>
                  </div>
                  
                  <div className="flex gap-3 mt-2 md:mt-0">
                    <Button 
                      size="default" 
                      variant="outline"
                      onClick={() => setSelectedScheduleIndex(selectedScheduleIndex === index ? null : index)}
                      className="min-w-[110px]"
                    >
                      {selectedScheduleIndex === index ? "시간표 닫기" : "시간표 보기"}
                    </Button>
                    
                    <Button 
                      size="default"
                      onClick={() => onApplySchedule(schedule)}
                      className="min-w-[110px]"
                    >
                      적용하기
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-base mb-5">
                  {schedule.설명 || schedule.description || "설명 없음"}
                </div>
                
                {selectedScheduleIndex === index && (
                  <div className="mt-6 animate-fade-in">
                    <h4 className="font-medium mb-4 text-lg">시간표 시각화</h4>
                    <ScheduleVisualizer schedule={schedule} />
                    
                    <h4 className="font-medium mt-8 mb-4 text-lg">수강 과목 목록</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(schedule.courses || schedule.과목들 || []).map((course, idx) => {
                        const courseName = course.course_name || course.과목_이름 || "Unknown";
                        const courseCode = course.course_code || course.학수번호 || "Unknown";
                        const courseCredit = course.credit || course.학점 || 0;
                        const courseTime = course.schedule_time || course.강의_시간 || "";
                        const courseRoom = course.classroom || course.강의실 || "";
                        
                        return (
                          <div key={idx} className="p-4 rounded-lg border">
                            <div className="font-medium text-base">{courseName}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {courseCode} ({courseCredit}학점)
                            </div>
                            <div className="text-sm mt-2">
                              {courseTime} - {courseRoom}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground text-lg">
            아직 생성된 시간표가 없습니다. "추천 시간표 생성하기" 버튼을 클릭하여 시간표를 생성해보세요.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedSchedulesDialog;
