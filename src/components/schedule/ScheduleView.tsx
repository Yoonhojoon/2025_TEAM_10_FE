
import React from "react";
import { Trash2 } from "lucide-react";
import { ConsolidatedCourse } from "@/types/schedule";
import { getDayLabel, getCourseColor } from "@/utils/scheduleUtils";

interface ScheduleViewProps {
  courses: ConsolidatedCourse[];
  onDeleteCourse: (id: string) => void;
  emptyCourseMessage?: string;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  courses, 
  onDeleteCourse,
  emptyCourseMessage = "아직 등록된 과목이 없습니다. '다른 계획 보기' 또는 '시간표 생성하기'를 이용해보세요."
}) => {
  if (courses.length === 0) {
    return (
      <div className="md:col-span-3 p-6 text-center text-muted-foreground border rounded-lg">
        {emptyCourseMessage}
      </div>
    );
  }

  return (
    <>
      {courses.map(course => (
        <div 
          key={course.code} 
          className="p-3 rounded-lg border"
          style={{ 
            borderLeftColor: getCourseColor(course.code), 
            borderLeftWidth: '4px',
            backgroundColor: course.fromHistory ? 'rgba(253, 242, 248, 0.3)' : undefined
          }}
        >
          <div className="font-medium">{course.name}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {course.scheduleTimes.map((time, idx) => (
              <div key={time.id} className="flex justify-between">
                <span>{getDayLabel(time.day)} {time.startTime}-{time.endTime}</span>
                <button
                  onClick={() => onDeleteCourse(time.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm">{course.credit}학점</div>
        </div>
      ))}
    </>
  );
};

export default ScheduleView;
