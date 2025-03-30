
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ScheduleVisualizer from "./ScheduleVisualizer";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>생성된 시간표</DialogTitle>
          <DialogDescription>
            AI가 생성한 시간표 조합입니다. 원하는 시간표를 선택하세요.
          </DialogDescription>
        </DialogHeader>
        
        {isGeneratingSchedules ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">시간표를 생성 중입니다. 잠시만 기다려주세요...</p>
          </div>
        ) : generatedSchedules.length > 0 ? (
          <div className="space-y-6 mt-4">
            {generatedSchedules.map((schedule, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-colors ${selectedScheduleIndex === index ? 'bg-secondary/40 border-primary' : 'hover:bg-secondary/30'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{schedule.name}</h3>
                    {(schedule.태그 || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {schedule.태그?.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm mt-2">
                      총 {schedule.총_학점 || schedule.total_credits}학점
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedScheduleIndex(selectedScheduleIndex === index ? null : index)}
                    >
                      {selectedScheduleIndex === index ? "시간표 닫기" : "시간표 보기"}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={() => {
                        onApplySchedule(schedule);
                        onOpenChange(false);
                      }}
                    >
                      적용하기
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-sm mb-4">
                  {schedule.설명 || schedule.description || "설명 없음"}
                </div>
                
                {selectedScheduleIndex === index && (
                  <div className="mt-4 animate-fade-in">
                    <h4 className="font-medium mb-3">시간표 시각화</h4>
                    <ScheduleVisualizer schedule={schedule} />
                    
                    <h4 className="font-medium mt-6 mb-3">수강 과목 목록</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(schedule.courses || schedule.과목들 || []).map((course, idx) => {
                        const courseName = course.course_name || course.과목_이름 || "Unknown";
                        const courseCode = course.course_code || course.학수번호 || "Unknown";
                        const courseCredit = course.credit || course.학점 || 0;
                        const courseTime = course.schedule_time || course.강의_시간 || "";
                        const courseRoom = course.classroom || course.강의실 || "";
                        
                        return (
                          <div key={idx} className="p-3 rounded-lg border">
                            <div className="font-medium">{courseName}</div>
                            <div className="text-sm text-muted-foreground">
                              {courseCode} ({courseCredit}학점)
                            </div>
                            <div className="text-sm mt-1">
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
          <div className="py-8 text-center text-muted-foreground">
            아직 생성된 시간표가 없습니다. "추천 시간표 생성하기" 버튼을 클릭하여 시간표를 생성해보세요.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedSchedulesDialog;
