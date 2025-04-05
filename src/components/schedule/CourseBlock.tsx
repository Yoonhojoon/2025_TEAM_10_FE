
import React from 'react';

interface CourseBlockProps {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  name: string;
  location: string;
  color: string;
  dayIndex: number;
}

const CourseBlock: React.FC<CourseBlockProps> = ({
  id,
  day,
  startTime,
  endTime,
  name,
  location,
  color,
  dayIndex
}) => {
  // Import from utils file to avoid duplication
  const timeToRowPosition = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours - 9) * 60 + minutes; // Minutes from 9:00 AM
  };

  const startMinutes = timeToRowPosition(startTime);
  const endMinutes = timeToRowPosition(endTime);
  const durationMinutes = endMinutes - startMinutes;
  
  // Calculate positioning
  const left = `calc(${(dayIndex + 1) * (100 / 6)}% + 1px)`;
  const top = `${startMinutes}px`;
  const height = `${durationMinutes}px`;
  const width = `calc(${100 / 6}% - 2px)`;
  
  return (
    <div
      className="absolute border-l-4 rounded-md border-primary shadow-sm p-2 overflow-hidden transition-all hover:shadow-md hover:z-20 z-10"
      style={{
        left,
        top,
        height,
        width,
        backgroundColor: color,
      }}
    >
      <div className="font-medium text-sm truncate">{name}</div>
      <div className="text-xs text-foreground/70 truncate">{location}</div>
      <div className="text-xs text-foreground/70 truncate">{startTime}-{endTime}</div>
    </div>
  );
};

export default CourseBlock;
