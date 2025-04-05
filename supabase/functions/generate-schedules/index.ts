
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
    
    const { userId, takenCourseIds, categories = ["전공필수", "전공선택", "전공기초"] } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
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
    
    // Fetch available courses based on department and categories
    const { data: availableCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .in('category', categories)
      .order('course_name', { ascending: true });
      
    if (coursesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch courses', details: coursesError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Filter out courses that the user has already taken
    const filteredCourses = availableCourses.filter(course => 
      !takenCourseIds.includes(course.course_id)
    );
    
    if (filteredCourses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: '수강 가능한 과목이 없습니다. 모든 과목을 이미 수강했거나, 다른 카테고리를 선택해보세요.',
          schedules: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate schedules using simple algorithm
    const schedules = generateSchedules(filteredCourses);
    
    return new Response(
      JSON.stringify({ 
        schedules,
        message: schedules.length > 0 ? undefined : '시간표를 생성할 수 없습니다. 다른 카테고리를 선택하거나 수강 내역을 확인해주세요.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to check time conflicts
function hasTimeConflict(courseA: Course, courseB: Course): boolean {
  // Simplified implementation for the sample
  if (courseA.schedule_time === courseB.schedule_time) {
    return true;
  }
  return false;
}

// Generate schedules using a simple greedy algorithm
function generateSchedules(courses: Course[]): Schedule[] {
  const schedules: Schedule[] = [];
  
  // Let's create 3 schedules with different approaches
  
  // Schedule 1: Maximize credits
  const creditSortedCourses = [...courses].sort((a, b) => b.credit - a.credit);
  const schedule1 = createSchedule(creditSortedCourses, "최대 학점 시간표");
  if (schedule1.과목들.length > 0) schedules.push(schedule1);
  
  // Schedule 2: Balanced (alternate selecting different categories)
  const categoryCourses = groupByCategory(courses);
  const schedule2 = createBalancedSchedule(categoryCourses, "균형 잡힌 시간표");
  if (schedule2.과목들.length > 0) schedules.push(schedule2);
  
  // Schedule 3: Random selection with preference to earlier classes
  const timeSortedCourses = [...courses].sort((a, b) => 
    a.schedule_time.localeCompare(b.schedule_time)
  );
  const schedule3 = createSchedule(timeSortedCourses, "이른 시간 선호 시간표");
  if (schedule3.과목들.length > 0) schedules.push(schedule3);
  
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
function createBalancedSchedule(categoryCourses: Record<string, Course[]>, name: string): Schedule {
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
        
        // Check for conflicts
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
function createSchedule(sortedCourses: Course[], name: string): Schedule {
  const selectedCourses: Course[] = [];
  let totalCredits = 0;
  const MAX_CREDITS = 18;
  
  for (const course of sortedCourses) {
    // Check for conflicts
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
