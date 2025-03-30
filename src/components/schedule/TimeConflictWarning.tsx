
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TimeConflict } from "@/types/schedule";
import { getDayLabel } from "@/utils/scheduleUtils";

interface TimeConflictWarningProps {
  conflicts: TimeConflict[];
}

const TimeConflictWarning: React.FC<TimeConflictWarningProps> = ({ conflicts }) => {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>시간표 충돌 발생</AlertTitle>
      <AlertDescription>
        <p className="mb-2">시간이 겹치는 과목이 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          {conflicts.map((conflict, index) => (
            <li key={index}>
              {getDayLabel(conflict.day)}: "{conflict.courseA}" ({conflict.timeA})와 "{conflict.courseB}" ({conflict.timeB})
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default TimeConflictWarning;
