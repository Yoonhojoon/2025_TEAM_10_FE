
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface SavedSchedule {
  schedule_id: string;
  created_at: string;
  description_tags: string[] | null;
  schedule_json: GeneratedSchedule;
  user_id?: string;
}

interface SavedSchedulesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  savedSchedules: SavedSchedule[];
  onApplySchedule: (schedule: GeneratedSchedule) => void;
  onSelectSchedule: (scheduleId: string) => void;
}

const SavedSchedulesDialog = ({
  isOpen,
  onOpenChange,
  savedSchedules,
  onApplySchedule,
  onSelectSchedule
}: SavedSchedulesDialogProps) => {
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-6 md:p-8 w-[90vw]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl md:text-2xl">저장된 시간표</DialogTitle>
          <DialogDescription className="text-base mt-2">
            이전에 저장한 시간표 목록입니다. 적용할 시간표를 선택하세요.
          </DialogDescription>
        </DialogHeader>
        
        {savedSchedules.length > 0 ? (
          <div className="space-y-8 mt-4">
            {savedSchedules.map((schedule, index) => (
              <div 
                key={schedule.schedule_id} 
                className={`border rounded-lg p-6 transition-colors ${selectedScheduleIndex === index ? 'bg-secondary/40 border-primary' : 'hover:bg-secondary/30'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-medium">{schedule.schedule_json.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      생성일: {new Date(schedule.created_at).toLocaleDateString()}
                    </div>
                    {schedule.description_tags && schedule.description_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {schedule.description_tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-base mt-3">
                      총 {schedule.schedule_json.총_학점 || schedule.schedule_json.total_credits}학점
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
                      onClick={() => {
                        onApplySchedule(schedule.schedule_json);
                        onSelectSchedule(schedule.schedule_id);
                        onOpenChange(false);
                      }}
                      className="min-w-[110px]"
                    >
                      적용하기
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-base mb-5">
                  {schedule.schedule_json.설명 || schedule.schedule_json.description || "설명 없음"}
                </div>
                
                {selectedScheduleIndex === index && (
                  <div className="mt-6 animate-fade-in">
                    <h4 className="font-medium mb-4 text-lg">시간표 시각화</h4>
                    <ScheduleVisualizer schedule={schedule.schedule_json} />
                    
                    <h4 className="font-medium mt-8 mb-4 text-lg">수강 과목 목록</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(schedule.schedule_json.courses || schedule.schedule_json.과목들 || []).map((course, idx) => {
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
            아직 저장된 시간표가 없습니다. 시간표를 생성하고 저장해보세요.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SavedSchedulesDialog;
