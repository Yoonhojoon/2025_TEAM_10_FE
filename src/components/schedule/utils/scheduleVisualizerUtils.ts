
import { CourseData } from "@/types/schedule";

// Map for translating course day/time format to our grid format
export const parseCourseSchedule = (timeString?: string): { day: string; startTime: string; endTime: string }[] => {
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
export const timeToRowPosition = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours - 9) * 60 + minutes; // Minutes from 9:00 AM
};

// Generate random color based on course code
export const getCourseColor = (courseCode: string): string => {
  const seed = courseCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = seed % 360;
  return `hsla(${hue}, 70%, 85%, 0.8)`;
};

// Map week days to Korean characters
export const dayLabels: Record<string, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
};

// Process course data for visualization
export const processCoursesForVisualization = (courseList: CourseData[]) => {
  return courseList.map(course => {
    // Handle both English and Korean field names
    const courseId = course.course_id || "";
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
      scheduleStr,
      color: getCourseColor(code)
    };
  });
};
