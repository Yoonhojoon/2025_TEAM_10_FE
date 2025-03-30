
import { v4 as uuidv4 } from "uuid";

export interface TimeSlot {
  day: "mon" | "tue" | "wed" | "thu" | "fri";
  startTime: string;
  endTime: string;
}

export const parseScheduleTime = (scheduleTime: string): TimeSlot[] => {
  try {
    const koreanDayMap: Record<string, "mon" | "tue" | "wed" | "thu" | "fri"> = {
      "월": "mon",
      "화": "tue",
      "수": "wed",
      "목": "thu",
      "금": "fri",
    };
    
    const englishDayMap: Record<string, "mon" | "tue" | "wed" | "thu" | "fri"> = {
      "mon": "mon",
      "tue": "tue",
      "wed": "wed",
      "thu": "thu",
      "fri": "fri",
    };
    
    const result: TimeSlot[] = [];
    
    const schedules = scheduleTime.split(',').map(s => s.trim());
    
    for (const schedule of schedules) {
      const parts = schedule.split(' ');
      if (parts.length !== 2) continue;
      
      const dayStr = parts[0].toLowerCase();
      const timeRange = parts[1].split('-');
      if (timeRange.length !== 2) continue;
      
      let day: "mon" | "tue" | "wed" | "thu" | "fri";
      
      if (koreanDayMap[parts[0]]) {
        day = koreanDayMap[parts[0]];
      } 
      else if (englishDayMap[dayStr]) {
        day = englishDayMap[dayStr];
      } 
      else {
        continue;
      }
      
      result.push({
        day,
        startTime: timeRange[0],
        endTime: timeRange[1]
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing schedule time:", error, "Input:", scheduleTime);
    return [];
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
