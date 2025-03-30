
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SavedSchedule } from "@/hooks/useSchedule";

interface ScheduleHeaderProps {
  isGeneratingSchedules: boolean;
  handleGenerateSchedules: () => Promise<void>;
  savedSchedules: SavedSchedule[];
  selectedSavedSchedule: string | null;
  handleViewSchedule: (scheduleId: string) => void;
  handleViewOtherSchedules: () => void;
}

const ScheduleHeader = ({
  isGeneratingSchedules,
  handleGenerateSchedules,
  savedSchedules,
  selectedSavedSchedule,
  handleViewSchedule,
  handleViewOtherSchedules
}: ScheduleHeaderProps) => {
  return (
    <>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">시간표 계획</h1>
        <p className="text-muted-foreground">
          다음 학기 수강 계획을 세우고 최적의 시간표를 만드세요.
        </p>
      </div>
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Button 
          onClick={handleGenerateSchedules} 
          disabled={isGeneratingSchedules}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isGeneratingSchedules ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              시간표 생성 중...
            </>
          ) : (
            <>추천 시간표 생성하기</>
          )}
        </Button>
        
        {savedSchedules.length > 0 && (
          <div className="flex items-center gap-2">
            <Select
              value={selectedSavedSchedule || ""}
              onValueChange={handleViewSchedule}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="저장된 시간표 보기" />
              </SelectTrigger>
              <SelectContent>
                {savedSchedules.map((schedule) => (
                  <SelectItem 
                    key={schedule.schedule_id} 
                    value={schedule.schedule_id}
                  >
                    {schedule.schedule_json.name}
                    {schedule.description_tags && schedule.description_tags.length > 0 && 
                      ` (${schedule.description_tags.join(', ')})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              size="icon"
              onClick={handleViewOtherSchedules}
              title="저장된 시간표 목록 보기"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduleHeader;
