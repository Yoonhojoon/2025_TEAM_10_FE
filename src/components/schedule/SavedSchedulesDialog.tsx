
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import ScheduleVisualizer from "./ScheduleVisualizer";
import { GeneratedSchedule, SavedSchedule } from "@/types/schedule";
import { useToast } from "@/hooks/use-toast";

interface SavedSchedulesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  savedSchedules: SavedSchedule[];
  onApplySchedule: (schedule: GeneratedSchedule) => void;
  onSelectSchedule: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  isDeletingSchedule?: boolean;
}

const SavedSchedulesDialog = ({
  isOpen,
  onOpenChange,
  savedSchedules,
  onApplySchedule,
  onSelectSchedule,
  onDeleteSchedule,
  isDeletingSchedule = false
}: SavedSchedulesDialogProps) => {
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(null);
  const [scheduleIdToDelete, setScheduleIdToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleDeleteClick = async (scheduleId: string) => {
    try {
      setScheduleIdToDelete(scheduleId);
      await onDeleteSchedule(scheduleId);
      setScheduleIdToDelete(null);
      toast({
        title: "시간표 삭제 완료",
        description: "선택한 시간표가 성공적으로 삭제되었습니다."
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "시간표 삭제 실패",
        description: "시간표 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setScheduleIdToDelete(null);
    }
  };
  
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
                        toast({
                          title: "시간표 적용 완료",
                          description: `${schedule.schedule_json.name} 시간표가 적용되었습니다.`
                        });
                      }}
                      className="min-w-[110px]"
                    >
                      적용하기
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteClick(schedule.schedule_id)}
                      disabled={isDeletingSchedule && scheduleIdToDelete === schedule.schedule_id}
                    >
                      {isDeletingSchedule && scheduleIdToDelete === schedule.schedule_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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
