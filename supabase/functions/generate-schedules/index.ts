
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Course {
  course_id: string;
  course_name: string;
  course_code: string;
  credit: number;
  schedule_time: string;
  classroom: string;
  category: string;
}

interface Schedule {
  name: string;
  과목들: Array<{
    course_id: string;
    과목_이름: string;
    학수번호: string;
    학점: number;
    강의_시간: string;
    강의실: string;
  }>;
  총_학점: number;
  설명: string;
}

interface Prerequisite {
  course_id: string;
  prerequisite_course_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Set up the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId, takenCourseIds, categories = ["전공필수", "전공선택", "전공기초"], courseOverlapCheckPriority = true, enrolledCourseIds = [] } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Log what courses are marked as taken
    console.log("User ID:", userId);
    console.log("Courses marked as taken (IDs):", takenCourseIds);
    console.log("Categories for course search:", categories);
    console.log("Currently enrolled course IDs:", enrolledCourseIds);
    
    // Fetch user department
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('department_id')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data', details: userError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const departmentId = userData.department_id;
    console.log("User department ID:", departmentId);
    
    // Fetch "전체" department ID
    const { data: generalDept, error: generalDeptError } = await supabase
      .from('departments')
      .select('department_id')
      .eq('department_name', '전체')
      .maybeSingle();
      
    if (generalDeptError) {
      console.log('Error fetching general department:', generalDeptError.message);
    }
    
    const generalDeptId = generalDept?.department_id;
    console.log("General department ID:", generalDeptId);
    
    // Create an array of department IDs to query
    const departmentIds = [departmentId];
    if (generalDeptId) {
      departmentIds.push(generalDeptId);
    }
    
    // Fetch available courses based on department(s) and categories
    const { data: availableCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('department_id', departmentIds)
      .in('category', categories)
      .order('course_name', { ascending: true });
      
    if (coursesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch courses', details: coursesError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`Found ${availableCourses.length} courses matching department and category criteria`);
    
    // Fetch all prerequisites
    const { data: prerequisites, error: prerequisitesError } = await supabase
      .from('prerequisites')
      .select('*');
    
    if (prerequisitesError) {
      console.log('Error fetching prerequisites:', prerequisitesError.message);
      // Continue without prerequisites check if there's an error
    } else {
      console.log(`Found ${prerequisites.length} prerequisite relationships in total`);
    }
    
    // Filter out courses that the user has already taken
    let filteredCourses = availableCourses.filter(course => 
      !takenCourseIds.includes(course.course_id)
    );
    
    console.log(`After filtering out taken courses, ${filteredCourses.length} courses remain`);
    
    // Debug info: log first few courses before prerequisite filtering
    console.log("Sample courses before prerequisite filtering:");
    filteredCourses.slice(0, 5).forEach(course => {
      console.log(`- ${course.course_name} (${course.course_code}), category: ${course.category}`);
    });
    
    // Filter out courses where prerequisites haven't been met
    if (prerequisites) {
      // Create lookup table for prerequisites
      const coursePrerequisites: Record<string, string[]> = {};
      prerequisites.forEach((prereq: Prerequisite) => {
        if (!coursePrerequisites[prereq.course_id]) {
          coursePrerequisites[prereq.course_id] = [];
        }
        coursePrerequisites[prereq.course_id].push(prereq.prerequisite_course_id);
      });
      
      // Filter courses based on prerequisites
      const coursesBeforePrereqFilter = filteredCourses.length;
      filteredCourses = filteredCourses.filter(course => {
        const prereqs = coursePrerequisites[course.course_id];
        if (!prereqs || prereqs.length === 0) {
          // No prerequisites for this course
          return true;
        }
        
        // Check if all prerequisites are in user's taken courses or currently enrolled courses
        const allPrereqsMet = prereqs.every(prereqId => 
          takenCourseIds.includes(prereqId) || enrolledCourseIds.includes(prereqId)
        );
        
        if (!allPrereqsMet) {
          // Log which prerequisites are missing
          const missingPrereqs = prereqs.filter(prereqId => 
            !takenCourseIds.includes(prereqId) && !enrolledCourseIds.includes(prereqId)
          );
          console.log(`Course ${course.course_name} (${course.course_code}) filtered out due to missing prerequisites: ${missingPrereqs.length} missing`);
        }
        
        return allPrereqsMet;
      });
      
      console.log(`Prerequisite filter removed ${coursesBeforePrereqFilter - filteredCourses.length} courses`);
    }
    
    // Log final course list
    console.log(`Final course list contains ${filteredCourses.length} courses`);
    console.log("Sample courses from final list:");
    filteredCourses.slice(0, 5).forEach(course => {
      console.log(`- ${course.course_name} (${course.course_code}), category: ${course.category}`);
    });
    
    if (filteredCourses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: '수강 가능한 과목이 없습니다. 모든 과목을 이미 수강했거나, 선수과목을 이수하지 않았거나, 다른 카테고리를 선택해보세요.',
          schedules: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate schedules using simple algorithm with strict time conflict checking
    const schedules = generateSchedules(filteredCourses, courseOverlapCheckPriority);
    
    return new Response(
      JSON.stringify({ 
        schedules,
        coursesConsidered: filteredCourses.length,
        message: schedules.length > 0 ? undefined : '시간표를 생성할 수 없습니다. 다른 카테고리를 선택하거나 수강 내역을 확인해주세요.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-schedules function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to check time conflicts
function hasTimeConflict(courseA: Course, courseB: Course): boolean {
  // Parse schedule time to extract day and time information
  const courseAInfo = parseScheduleTime(courseA.schedule_time);
  const courseBInfo = parseScheduleTime(courseB.schedule_time);
  
  // Check for conflicts across all time slots
  for (const slotA of courseAInfo) {
    for (const slotB of courseBInfo) {
      // If not the same day, no conflict
      if (slotA.day !== slotB.day) continue;
      
      // Convert times to minutes for easier comparison
      const startA = timeToMinutes(slotA.startTime);
      const endA = timeToMinutes(slotA.endTime);
      const startB = timeToMinutes(slotB.startTime);
      const endB = timeToMinutes(slotB.endTime);
      
      // Check for overlap
      if ((startA < endB && endA > startB)) {
        return true; // Conflict found
      }
    }
  }
  
  return false; // No conflicts
}

// Helper to parse schedule time string
function parseScheduleTime(timeStr: string): Array<{day: string, startTime: string, endTime: string}> {
  // Default result if parsing fails
  const defaultResult = [{day: 'mon', startTime: '09:00', endTime: '10:00'}];
  
  if (!timeStr) return defaultResult;
  
  try {
    const result = [];
    const parts = timeStr.split(',').map(p => p.trim());
    
    for (const part of parts) {
      const match = part.match(/([월화수목금]|mon|tue|wed|thu|fri)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/i);
      
      if (match) {
        const dayKor = match[1];
        let day: string;
        
        // Map Korean day to English abbreviation
        if (dayKor === '월' || dayKor.toLowerCase() === 'mon') day = 'mon';
        else if (dayKor === '화' || dayKor.toLowerCase() === 'tue') day = 'tue';
        else if (dayKor === '수' || dayKor.toLowerCase() === 'wed') day = 'wed';
        else if (dayKor === '목' || dayKor.toLowerCase() === 'thu') day = 'thu';
        else if (dayKor === '금' || dayKor.toLowerCase() === 'fri') day = 'fri';
        else day = 'mon'; // Default if can't parse
        
        result.push({
          day,
          startTime: match[2],
          endTime: match[3]
        });
      }
    }
    
    return result.length > 0 ? result : defaultResult;
  } catch (e) {
    console.error('Error parsing schedule time:', e);
    return defaultResult;
  }
}

// Convert time string (e.g. "14:30") to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Generate schedules using a simple algorithm that prioritizes avoiding time conflicts
function generateSchedules(courses: Course[], prioritizeNoConflicts = true): Schedule[] {
  const schedules: Schedule[] = [];
  
  // ALWAYS strictly check for time conflicts to ensure no overlaps
  
  // Schedule 1: Maximize credits while avoiding conflicts
  const creditSortedCourses = [...courses].sort((a, b) => b.credit - a.credit);
  const schedule1 = createSchedule(creditSortedCourses, "최대 학점 시간표", true);
  if (schedule1.과목들.length > 0) schedules.push(schedule1);
  
  // Schedule 2: Balanced (alternate selecting different categories)
  const categoryCourses = groupByCategory(courses);
  const schedule2 = createBalancedSchedule(categoryCourses, "균형 잡힌 시간표", true);
  if (schedule2.과목들.length > 0) schedules.push(schedule2);
  
  // Schedule 3: Random selection with preference to earlier classes
  const timeSortedCourses = [...courses].sort((a, b) => 
    a.schedule_time.localeCompare(b.schedule_time)
  );
  const schedule3 = createSchedule(timeSortedCourses, "이른 시간 선호 시간표", true);
  if (schedule3.과목들.length > 0) schedules.push(schedule3);
  
  console.log(`Generated ${schedules.length} distinct schedules`);
  schedules.forEach((schedule, i) => {
    console.log(`Schedule ${i+1}: "${schedule.name}" with ${schedule.과목들.length} courses and ${schedule.총_학점} credits`);
  });
  
  return schedules;
}

// Group courses by category
function groupByCategory(courses: Course[]): Record<string, Course[]> {
  const result: Record<string, Course[]> = {};
  
  courses.forEach(course => {
    if (!result[course.category]) {
      result[course.category] = [];
    }
    result[course.category].push(course);
  });
  
  return result;
}

// Create a balanced schedule by picking from different categories
function createBalancedSchedule(categoryCourses: Record<string, Course[]>, name: string, strictTimeCheck = true): Schedule {
  const selectedCourses: Course[] = [];
  const courseIds = new Set<string>();
  
  // Get categories as an array
  const categories = Object.keys(categoryCourses);
  
  // We'll try to select one course from each category in rotation
  let totalCredits = 0;
  const MAX_CREDITS = 18;
  let keepGoing = true;
  
  while (keepGoing) {
    keepGoing = false;
    
    for (const category of categories) {
      const courses = categoryCourses[category];
      
      // Find a course from this category that doesn't conflict
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        
        // Skip if we've already included this course
        if (courseIds.has(course.course_id)) continue;
        
        // Check for conflicts - ALWAYS strict check
        const hasConflict = selectedCourses.some(selectedCourse => 
          hasTimeConflict(selectedCourse, course)
        );
        
        // Check if adding this course would exceed our credit limit
        if (!hasConflict && totalCredits + course.credit <= MAX_CREDITS) {
          selectedCourses.push(course);
          courseIds.add(course.course_id);
          totalCredits += course.credit;
          courses.splice(i, 1); // Remove the course from consideration
          keepGoing = true;
          break;
        }
      }
    }
  }
  
  return {
    name,
    과목들: selectedCourses.map(course => ({
      course_id: course.course_id,
      과목_이름: course.course_name,
      학수번호: course.course_code,
      학점: course.credit,
      강의_시간: course.schedule_time,
      강의실: course.classroom
    })),
    총_학점: totalCredits,
    설명: `${name}입니다. 총 ${totalCredits}학점으로 구성되었습니다.`
  };
}

// Create a schedule from a sorted list
function createSchedule(sortedCourses: Course[], name: string, strictTimeCheck = true): Schedule {
  const selectedCourses: Course[] = [];
  let totalCredits = 0;
  const MAX_CREDITS = 18;
  
  for (const course of sortedCourses) {
    // ALWAYS strictly check for conflicts to ensure no overlaps
    const hasConflict = selectedCourses.some(selectedCourse => 
      hasTimeConflict(selectedCourse, course)
    );
    
    // Check if adding this course would exceed our credit limit
    if (!hasConflict && totalCredits + course.credit <= MAX_CREDITS) {
      selectedCourses.push(course);
      totalCredits += course.credit;
    }
    
    // Stop if we've reached a good number of credits
    if (totalCredits >= 15) break;
  }
  
  return {
    name,
    과목들: selectedCourses.map(course => ({
      course_id: course.course_id,
      과목_이름: course.course_name,
      학수번호: course.course_code,
      학점: course.credit,
      강의_시간: course.schedule_time,
      강의실: course.classroom
    })),
    총_학점: totalCredits,
    설명: `${name}입니다. 총 ${totalCredits}학점으로 구성되었습니다.`
  };
}
