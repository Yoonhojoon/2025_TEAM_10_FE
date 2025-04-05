
import { v4 as uuidv4 } from "uuid";

export interface TimeSlot {
  day: "mon" | "tue" | "wed" | "thu" | "fri";
  startTime: string;
  endTime: string;
}

export const parseScheduleTime = (scheduleTime: string) => {
  try {
    console.log("Parsing schedule time:", scheduleTime);
    if (!scheduleTime || typeof scheduleTime !== 'string') {
      console.warn("Invalid schedule time input:", scheduleTime);
      return [];
    }
    
    // Handle multiple schedule times (e.g. "월 10:00-12:00, 수 14:00-16:00")
    const schedules = scheduleTime.split(',').map(s => s.trim());
    const result = [];
    
    for (const schedule of schedules) {
      console.log("Processing schedule part:", schedule);
      
      // Extract day and time separately with regex
      const dayMatch = schedule.match(/[월화수목금]/);
      const timeMatch = schedule.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      
      if (!dayMatch || !timeMatch) {
        console.warn("Schedule format incorrect:", schedule);
        continue;
      }
      
      const day = dayMatch[0];
      // Map Korean day to English
      let dayCode: string;
      
      if (day === '월') {
        dayCode = 'mon';
      } else if (day === '화') {
        dayCode = 'tue';
      } else if (day === '수') {
        dayCode = 'wed';
      } else if (day === '목') {
        dayCode = 'thu';
      } else if (day === '금') {
        dayCode = 'fri';
      } else {
        console.warn("Unknown day format:", day);
        dayCode = 'mon'; // Default to Monday if unknown
      }
      
      // Parse time range
      const startHour = parseInt(timeMatch[1]);
      const startMinute = parseInt(timeMatch[2]);
      const endHour = parseInt(timeMatch[3]);
      const endMinute = parseInt(timeMatch[4]);
      
      // Format time as HH:MM
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      result.push({
        day: dayCode as 'mon' | 'tue' | 'wed' | 'thu' | 'fri',
        startTime,
        endTime
      });
    }
    
    console.log("Parsed schedule results:", result);
    return result;
  } catch (error) {
    console.error("Error parsing schedule time:", error, scheduleTime);
    return [];
  }
};

const ensureTimeFormat = (time: string): string => {
  try {
    // If time doesn't include seconds, add them
    if (time.includes(':') && time.split(':').length === 2) {
      return time;
    }
    
    // If time has no colon, assume it's just hours
    if (!time.includes(':')) {
      // Pad with leading zero if needed
      const hours = time.padStart(2, '0');
      return `${hours}:00`;
    }
    
    return time;
  } catch (error) {
    console.error("Error formatting time:", error, time);
    return "00:00"; // Fallback to default time
  }
};

export const getDayLabel = (day: string): string => {
  const dayLabels: Record<string, string> = {
    "mon": "월요일",
    "tue": "화요일",
    "wed": "수요일",
    "thu": "목요일",
    "fri": "금요일",
  };
  return dayLabels[day] || day;
};

export const getKoreanDayAbbreviation = (day: string): string => {
  const dayMap: Record<string, string> = {
    "mon": "월",
    "tue": "화",
    "wed": "수",
    "thu": "목",
    "fri": "금",
  };
  return dayMap[day] || day;
};

export const getCourseColor = (courseCode: string): string => {
  const seed = courseCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = seed % 360;
  return `hsla(${hue}, 70%, 85%, 0.8)`;
};

export const formatScheduleTime = (day: string, startTime: string, endTime: string): string => {
  const koreanDay = getKoreanDayAbbreviation(day);
  return `${koreanDay} ${startTime}-${endTime}`;
};
