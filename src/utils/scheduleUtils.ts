
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
      const parts = schedule.split(' ');
      
      // Need at least day and time parts
      if (parts.length < 2) {
        console.warn("Schedule format incorrect, missing parts:", schedule);
        continue;
      }
      
      // Map Korean day to English
      const dayPart = parts[0];
      let day: string;
      
      if (dayPart === '월' || dayPart.toLowerCase() === 'mon') {
        day = 'mon';
      } else if (dayPart === '화' || dayPart.toLowerCase() === 'tue') {
        day = 'tue';
      } else if (dayPart === '수' || dayPart.toLowerCase() === 'wed') {
        day = 'wed';
      } else if (dayPart === '목' || dayPart.toLowerCase() === 'thu') {
        day = 'thu';
      } else if (dayPart === '금' || dayPart.toLowerCase() === 'fri') {
        day = 'fri';
      } else {
        console.warn("Unknown day format:", dayPart);
        day = 'mon'; // Default to Monday if unknown
      }
      
      // Parse time range
      const timePart = parts[1];
      const timeRange = timePart.split('-');
      
      if (timeRange.length !== 2) {
        console.warn("Time range format incorrect:", timePart);
        continue;
      }
      
      // Ensure time format has seconds if needed
      const startTime = ensureTimeFormat(timeRange[0]);
      const endTime = ensureTimeFormat(timeRange[1]);
      
      result.push({
        day: day as 'mon' | 'tue' | 'wed' | 'thu' | 'fri',
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
