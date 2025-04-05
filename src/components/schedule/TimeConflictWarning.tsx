
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TimeConflict, PrerequisiteWarning } from "@/types/schedule";
import { getDayLabel } from "@/utils/scheduleUtils";

interface TimeConflictWarningProps {
  conflicts: TimeConflict[];
  prerequisiteWarnings?: PrerequisiteWarning[];
}

const TimeConflictWarning: React.FC<TimeConflictWarningProps> = ({ conflicts, prerequisiteWarnings = [] }) => {
  if (conflicts.length === 0 && prerequisiteWarnings.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>시간표 문제 발생</AlertTitle>
      <AlertDescription>
        {conflicts.length > 0 && (
          <>
            <p className="mb-2">시간이 겹치는 과목이 있습니다:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              {conflicts.map((conflict, index) => (
                <li key={`conflict-${index}`}>
                  {getDayLabel(conflict.day)}: "{conflict.courseA}" ({conflict.timeA})와 "{conflict.courseB}" ({conflict.timeB})
                </li>
              ))}
            </ul>
          </>
        )}
        
        {prerequisiteWarnings.length > 0 && (
          <>
            <p className="mb-2">선수과목을 이수하지 않은 과목이 있습니다:</p>
            <ul className="list-disc pl-5 space-y-1">
              {prerequisiteWarnings.map((warning, index) => (
                <li key={`prereq-${index}`}>
                  <span className="font-medium">{warning.courseName}</span> ({warning.courseCode})는 다음 선수과목이 필요합니다: 
                  <span className="text-amber-700">
                    {warning.missingPrerequisites.map(prereq => ` ${prereq.course_name} (${prereq.course_code})`).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TimeConflictWarning;
