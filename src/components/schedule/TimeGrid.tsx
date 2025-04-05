
import React from 'react';
import { dayLabels } from './utils/scheduleVisualizerUtils';

interface TimeGridProps {
  children: React.ReactNode;
}

const TimeGrid: React.FC<TimeGridProps> = ({ children }) => {
  // Define the time slots (hours) to display
  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
  
  // Define days of the week
  const days = ["mon", "tue", "wed", "thu", "fri"];
  
  return (
    <div className="min-w-[800px] border rounded-lg bg-secondary/30 overflow-hidden shadow-sm">
      {/* Header row with day names */}
      <div className="grid grid-cols-6 border-b bg-background/60">
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
        
        {/* Course blocks will be rendered here as children */}
        {children}
      </div>
    </div>
  );
};

export default TimeGrid;
