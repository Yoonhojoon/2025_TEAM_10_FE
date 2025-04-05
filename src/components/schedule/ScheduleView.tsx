
import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, MapPin, X } from 'lucide-react';
import { ConsolidatedCourse } from '@/types/schedule';
import { getKoreanDayAbbreviation } from '@/utils/scheduleUtils';

interface ScheduleViewProps {
  courses: ConsolidatedCourse[];
  onDeleteCourse?: (id: string) => void;
  readOnly?: boolean;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ courses, onDeleteCourse, readOnly = false }) => {
  if (courses.length === 0) {
    return (
      <div className="col-span-3 p-8 text-center border border-dashed rounded-lg">
        <p className="text-muted-foreground">등록된 과목이 없습니다. 과목을 추가해주세요.</p>
      </div>
    );
  }
  
  return (
    <>
      {courses.map((course) => (
        <div 
          key={course.id}
          className="relative border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
        >
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-start">
              <h5 className="font-medium line-clamp-1">{course.name}</h5>
              {!readOnly && onDeleteCourse && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => onDeleteCourse(course.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>
            
            <Badge variant="outline" className="w-fit">
              {course.code}
            </Badge>
            
            <p className="text-sm font-medium">
              {course.credit}학점
            </p>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <div className="space-y-1">
                {course.scheduleTimes.map((time, idx) => (
                  <div key={idx}>
                    {getKoreanDayAbbreviation(time.day)} {time.startTime}-{time.endTime}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>
                {course.location || '미정'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ScheduleView;
