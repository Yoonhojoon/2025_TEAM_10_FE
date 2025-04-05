
import React from "react";
import { GeneratedSchedule } from "@/types/schedule";
import TimeGrid from "./TimeGrid";
import CourseBlock from "./CourseBlock";
import { processCoursesForVisualization } from "./utils/scheduleVisualizerUtils";

interface ScheduleVisualizerProps {
  schedule?: GeneratedSchedule;
}

const ScheduleVisualizer: React.FC<ScheduleVisualizerProps> = ({ schedule }) => {
  // Define days of the week for mapping
  const days = ["mon", "tue", "wed", "thu", "fri"];
  
  // Process courses from the schedule
  const courseList = schedule?.courses || schedule?.과목들 || [];
  
  // Transform courses for visualization
  const visualCourses = processCoursesForVisualization(courseList);

  console.log("Visual courses data:", visualCourses);

  return (
    <div className="w-full overflow-auto pb-4">
      <TimeGrid>
        {/* Course blocks as absolute positioned elements */}
        {visualCourses.map(course => 
          course.scheduleParsed.map((slot, index) => {
            // Calculate position based on day and time
            const dayIndex = days.indexOf(slot.day);
            if (dayIndex === -1) return null;
            
            return (
              <CourseBlock
                key={`${course.id}-${index}`}
                id={course.id}
                day={slot.day}
                startTime={slot.startTime}
                endTime={slot.endTime}
                name={course.name}
                location={course.location}
                color={course.color}
                dayIndex={dayIndex}
              />
            );
          })
        )}
      </TimeGrid>
    </div>
  );
};

export default ScheduleVisualizer;
