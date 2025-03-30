
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>저장된 시간표</DialogTitle>
          <DialogDescription>
            이전에 저장한 시간표 목록입니다. 적용할 시간표를 선택하세요.
          </DialogDescription>
        </DialogHeader>
        
        {savedSchedules.length > 0 ? (
          <div className="space-y-6 mt-4">
            {savedSchedules.map((schedule) => (
              <div 
                key={schedule.schedule_id} 
                className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{schedule.schedule_json.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      생성일: {new Date(schedule.created_at).toLocaleDateString()}
                    </div>
                    {schedule.description_tags && schedule.description_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {schedule.description_tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm mt-2">
                      총 {schedule.schedule_json.총_학점 || schedule.schedule_json.total_credits}학점
                    </p>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => {
                      onApplySchedule(schedule.schedule_json);
                      onSelectSchedule(schedule.schedule_id);
                      onOpenChange(false);
                    }}
                  >
                    적용하기
                  </Button>
                </div>
                
                <div className="mt-4 text-sm">
                  {schedule.schedule_json.설명 || schedule.schedule_json.description || "설명 없음"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            아직 저장된 시간표가 없습니다. 시간표를 생성하고 저장해보세요.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SavedSchedulesDialog;
