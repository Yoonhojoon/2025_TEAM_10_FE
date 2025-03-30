
import React from "react";
import { Clock } from "lucide-react";

interface ScheduleCourse {
  course_id?: string;
  course_name?: string;
  course_code?: string;
  credit?: number;
  schedule_time?: string;
  classroom?: string;
  과목_이름?: string;
  학수번호?: string;
  학점?: number;
  강의_시간?: string;
  강의실?: string;
}

interface GeneratedSchedule {
  name: string;
  태그?: string[];
  과목들?: ScheduleCourse[];
  courses?: ScheduleCourse[];
  총_학점?: number;
  total_credits?: number;
  설명?: string;
  description?: string;
}

interface ScheduleVisualizerProps {
  schedule?: GeneratedSchedule;
}

// Map for translating course day/time format to our grid format
const parseCourseSchedule = (timeString?: string): { day: string; startTime: string; endTime: string }[] => {
  if (!timeString) return [];
  
  const result: { day: string; startTime: string; endTime: string }[] = [];
  
  // Format is typically "월 10:00-11:30, 수 13:00-14:30"
  const schedules = timeString.split(',').map(s => s.trim());
  
  for (const schedule of schedules) {
    // Extract day and time
    const dayMatch = schedule.match(/[월화수목금]/);
    const timeMatch = schedule.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    
    if (dayMatch && timeMatch) {
      const day = dayMatch[0];
      const dayMapping: Record<string, string> = {
        '월': 'mon',
        '화': 'tue',
        '수': 'wed',
        '목': 'thu',
        '금': 'fri'
      };
      
      const startHour = parseInt(timeMatch[1]);
      const startMinute = parseInt(timeMatch[2]);
      const endHour = parseInt(timeMatch[3]);
      const endMinute = parseInt(timeMatch[4]);
      
      // Format time as HH:MM
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      result.push({
        day: dayMapping[day] || 'mon',
        startTime,
        endTime
      });
    }
  }
  
  return result;
};

// Convert time string (e.g., "09:30") to row position
const timeToRowPosition = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours - 9) * 60 + minutes; // Minutes from 9:00 AM
};

// Generate random color based on course code
const getCourseColor = (courseCode: string): string => {
  const seed = courseCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = seed % 360;
  return `hsla(${hue}, 70%, 85%, 0.8)`;
};

const ScheduleVisualizer: React.FC<ScheduleVisualizerProps> = ({ schedule }) => {
  // Define the time slots (hours) to display
  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
  
  // Define days of the week
  const days = ["mon", "tue", "wed", "thu", "fri"];
  const dayLabels = {
    mon: "월",
    tue: "화",
    wed: "수",
    thu: "목",
    fri: "금",
  };
  
  // Process courses from the schedule
  const courses = schedule?.courses || schedule?.과목들 || [];
  
  // Transform courses for visualization
  const visualCourses = courses.map(course => {
    const courseId = course.course_id || Math.random().toString(36).substring(7);
    const name = course.course_name || course.과목_이름 || "Unknown";
    const code = course.course_code || course.학수번호 || "Unknown";
    const location = course.classroom || course.강의실 || "";
    const scheduleStr = course.schedule_time || course.강의_시간 || "";
    
    return {
      id: courseId,
      name,
      code,
      location,
      scheduleParsed: parseCourseSchedule(scheduleStr),
      scheduleStr
    };
  });

  return (
    <div className="w-full overflow-auto pb-4">
      <div className="min-w-[800px] border rounded-lg bg-secondary/30 overflow-hidden">
        {/* Header row with day names */}
        <div className="grid grid-cols-6 border-b">
          <div className="p-2 text-center font-medium"></div>
          {days.map(day => (
            <div key={day} className="p-2 text-center font-medium border-l">
              {dayLabels[day as keyof typeof dayLabels]}
            </div>
          ))}
        </div>
        
        {/* Time grid with courses */}
        <div className="relative">
          {/* Time rows */}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-6 border-b" style={{ height: '60px' }}>
              {/* Time label */}
              <div className="flex items-center justify-center border-r text-sm text-muted-foreground">
                {hour}
              </div>
              
              {/* Day columns */}
              {days.map((day, dayIndex) => (
                <div key={`${day}-${hour}`} className="border-l relative">
                  {/* This creates the grid cell */}
                </div>
              ))}
            </div>
          ))}
          
          {/* Course blocks as absolute positioned elements */}
          {visualCourses.map(course => 
            course.scheduleParsed.map((slot, index) => {
              // Calculate position based on day and time
              const dayIndex = days.indexOf(slot.day);
              if (dayIndex === -1) return null;
              
              const startMinutes = timeToRowPosition(slot.startTime);
              const endMinutes = timeToRowPosition(slot.endTime);
              const durationMinutes = endMinutes - startMinutes;
              
              // Calculate positioning
              const left = `calc(${(dayIndex + 1) * (100 / 6)}% + 1px)`;
              const top = `${startMinutes}px`;
              const height = `${durationMinutes}px`;
              const width = `calc(${100 / 6}% - 2px)`;
              
              const backgroundColor = getCourseColor(course.code);
              
              return (
                <div
                  key={`${course.id}-${index}`}
                  className="absolute border border-primary/20 shadow-sm p-2 overflow-hidden transition-all hover:shadow-md z-10"
                  style={{
                    left,
                    top,
                    height,
                    width,
                    backgroundColor,
                  }}
                >
                  <div className="font-medium text-sm truncate">{course.name}</div>
                  <div className="text-xs text-foreground/70 truncate">{course.location}</div>
                  <div className="text-xs text-foreground/70 truncate">{slot.startTime}-{slot.endTime}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisualizer;
