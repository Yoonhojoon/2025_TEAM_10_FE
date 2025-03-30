
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
  schedule: GeneratedSchedule;
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

const ScheduleVisualizer: React.FC<ScheduleVisualizerProps> = ({ schedule }) => {
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const days = ["mon", "tue", "wed", "thu", "fri"];
  const dayLabels = {
    mon: "월요일",
    tue: "화요일",
    wed: "수요일",
    thu: "목요일",
    fri: "금요일",
  };
  
  // Process courses from the schedule
  const courses = schedule.courses || schedule.과목들 || [];
  
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
  
  // Color generator function
  const getCourseColor = (course: { id: string; name: string; code: string }) => {
    const seed = course.code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = seed % 360;
    return `hsla(${hue}, 70%, 85%, 0.8)`;
  };
  
  // Calculate positioning for a course
  const getCourseStyle = (startTime: string, endTime: string, day: string) => {
    // Parse time to get hour and minute components
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    const endHour = parseInt(endTime.split(":")[0]);
    const endMinute = parseInt(endTime.split(":")[1]);
    
    // Calculate grid positions
    // Start row is based on the hour offset from 9:00 (first time slot)
    // We add fractional value for minutes
    const startRow = (startHour - 9) + (startMinute / 60);
    const endRow = (endHour - 9) + (endMinute / 60);
    
    // Duration in grid rows (using fractional values for minutes)
    const duration = endRow - startRow;
    
    // Find which day column to use (1-based)
    const dayIndex = days.indexOf(day) + 2; // +2 because first column is for time labels
    
    return {
      gridRowStart: startRow + 2, // +2 for header row and offset
      gridRowEnd: 'span ' + (duration * 12), // Multiply by 12 for 5-minute intervals (12 per hour)
      gridColumnStart: dayIndex,
      gridColumnEnd: dayIndex + 1,
    };
  };
  
  return (
    <div className="overflow-auto pb-2">
      <div className="min-w-[800px] border rounded-lg bg-secondary/30 p-2 overflow-hidden">
        <div 
          className="grid relative"
          style={{ 
            gridTemplateColumns: "80px repeat(5, 1fr)",
            gridTemplateRows: "auto repeat(144, 5px)", // 12 rows per hour (5 min intervals) * 12 hours
            gap: "1px"
          }}
        >
          {/* Header row with day labels */}
          <div className="bg-transparent h-12 flex items-center justify-center font-medium col-span-1 row-span-1">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {days.map(day => (
            <div 
              key={day} 
              className="bg-secondary h-12 rounded-md flex items-center justify-center font-medium col-span-1 row-span-1"
            >
              {dayLabels[day as keyof typeof dayLabels]}
            </div>
          ))}
          
          {/* Time labels on the left and grid cells */}
          {timeSlots.map((time, index) => (
            <React.Fragment key={`row-${time}`}>
              {/* Time label */}
              <div 
                className="bg-transparent flex items-center justify-start pt-1 pl-2 text-sm text-muted-foreground"
                style={{ 
                  gridRowStart: index * 12 + 2, // +2 for header offset
                  gridRowEnd: 'span 12', // Each hour spans 12 rows (5 min intervals)
                  gridColumnStart: 1,
                  gridColumnEnd: 2,
                }}
              >
                {time}
              </div>
              
              {/* Grid cells for each day/time combination */}
              {days.map((day, dayIndex) => (
                <div
                  key={`cell-${day}-${time}`}
                  className="bg-card/70 rounded-md border border-border/50"
                  style={{ 
                    gridRowStart: index * 12 + 2, // +2 for header offset
                    gridRowEnd: 'span 12', // Each hour spans 12 rows
                    gridColumnStart: dayIndex + 2, // +2 for time label column
                    gridColumnEnd: dayIndex + 3,
                  }}
                />
              ))}
            </React.Fragment>
          ))}
          
          {/* Course blocks */}
          {visualCourses.map((course) => (
            course.scheduleParsed.map((schedule, index) => {
              const style = getCourseStyle(schedule.startTime, schedule.endTime, schedule.day);
              
              return (
                <div
                  key={`${course.id}-${index}`}
                  className="absolute rounded-md border border-primary/20 shadow-sm p-2 overflow-hidden transition-all hover:shadow-md z-10"
                  style={{
                    top: `calc(${style.gridRowStart - 1} * 5px + 48px)`, // 48px for header
                    left: `calc(${style.gridColumnStart - 1} * 16.67% + 80px)`, // 16.67% for each day column, 80px for time column
                    height: `calc(${style.gridRowEnd.split(' ')[1]} * 5px)`,
                    width: 'calc(16.67% - 4px)', // 16.67% width for each day column, minus some padding
                    backgroundColor: getCourseColor(course),
                  }}
                >
                  <div className="font-medium text-sm truncate">{course.name}</div>
                  <div className="text-xs text-foreground/70 mt-1 truncate">{course.location}</div>
                  <div className="text-xs text-foreground/70 truncate">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisualizer;
