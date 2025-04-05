
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
  태그?: string[];
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestBody = await req.json();
    console.log("Full request body received by Edge Function:", JSON.stringify(requestBody, null, 2));
    
    const { userId, enrolledCourseIds = [], categories = ["전공필수", "전공선택", "전공기초"], courseOverlapCheckPriority = true } = requestBody;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Log what courses are marked as taken/enrolled
    console.log("User ID:", userId);
    console.log("Courses marked as enrolled (IDs):", enrolledCourseIds);
    console.log("Categories for course search:", categories);
    
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
    
    // Filter out courses that the user has already taken OR is currently enrolled in
    const unregisteredCourses = availableCourses.filter(course => 
      !enrolledCourseIds.includes(course.course_id)
    );
    
    console.log(`After filtering out enrolled courses, ${unregisteredCourses.length} courses remain`);
    
    // Log the first few courses that remain after filtering (these are the non-taken courses)
    console.log("Sample of available non-taken courses (미이수 과목):");
    unregisteredCourses.slice(0, 10).forEach(course => {
      console.log(`- ${course.course_name} (${course.course_code}), category: ${course.category}, credit: ${course.credit}`);
    });
    
    if (unregisteredCourses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: '수강 가능한 과목이 없습니다. 모든 과목을 이미 수강했거나, 선수과목을 이수하지 않았거나, 다른 카테고리를 선택해보세요.',
          schedules: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare the prompt for OpenAI with the specific format requested
    const promptContent = `
      나는 다음 과목들을 사용하여 3개의 최적의 수업 시간표를 만들고 싶습니다:
      ${unregisteredCourses.map(course => 
        `- ${course.course_name} (${course.course_code}): ${course.credit}학점, 시간: ${course.schedule_time}, 장소: ${course.classroom || '미정'}`
      ).join('\n')}

      시간표 생성 규칙:
      1. 수업 시간이 겹치지 않아야 함
      2. 각 시간표는 15-21학점 사이여야 함
      3. 수업이 다양한 요일에 골고루 분산되도록 함
      4. 가능하면 다양한 과목 유형을 포함해야 함

      다음 JSON 형식으로 정확히 3개의 시간표를 제공해주세요:
      {
        "schedules": [
          {
            "name": "시간표 옵션 1",
            "태그": ["균형잡힌", "알찬"],
            "과목들": [
              {
                "course_id": "[course_id]",
                "과목_이름": "[course_name]",
                "학수번호": "[course_code]",
                "학점": [credit],
                "강의_시간": "[schedule_time]",
                "강의실": "[classroom]"
              }
            ],
            "총_학점": [sum of credits],
            "설명": "[이 시간표의 장점에 대한 간략한 설명]"
          }
        ]
      }

      응답에는 JSON만 포함해야 하며 추가 텍스트는 포함하지 않아야 합니다.
    `;
    
    console.log("Calling OpenAI with prompt for schedule generation");
    
    try {
      // Call OpenAI API
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "당신은 수업 시간표를 만드는 AI 도우미입니다. 항상 JSON만 응답합니다."
            },
            {
              role: "user",
              content: promptContent
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error("OpenAI API error:", errorText);
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const openaiData = await openaiResponse.json();
      console.log("OpenAI response received");
      
      // Extract the response content
      const responseContent = openaiData.choices[0].message.content;
      console.log("OpenAI raw response:", responseContent);
      
      // Parse the JSON from the response
      // Find JSON content in the response (it might have markdown code blocks or other text)
      let jsonContent = responseContent;
      
      // Try to extract JSON if wrapped in code blocks
      const jsonRegex = /```(?:json)?([\s\S]*?)```/;
      const jsonMatch = responseContent.match(jsonRegex);
      
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1].trim();
      }
      
      // Parse the JSON
      let parsedSchedules;
      try {
        parsedSchedules = JSON.parse(jsonContent);
        console.log("Successfully parsed JSON from OpenAI response");
      } catch (parseError) {
        console.error("Error parsing JSON from OpenAI response:", parseError);
        // Try one more time with a more aggressive approach to find valid JSON
        try {
          const possibleJson = responseContent.substring(
            responseContent.indexOf('{'),
            responseContent.lastIndexOf('}') + 1
          );
          parsedSchedules = JSON.parse(possibleJson);
          console.log("Successfully parsed JSON with fallback method");
        } catch (fallbackError) {
          throw new Error("Failed to parse valid JSON from OpenAI response");
        }
      }
      
      // Process the schedules if found
      let schedules = [];
      
      if (parsedSchedules && parsedSchedules.schedules && Array.isArray(parsedSchedules.schedules)) {
        schedules = parsedSchedules.schedules;
        console.log(`Extracted ${schedules.length} schedules from OpenAI response`);
        
        // Validate each schedule
        schedules = schedules.map(schedule => {
          // Ensure course_id is correctly populated from the original course data
          if (schedule.과목들 && Array.isArray(schedule.과목들)) {
            schedule.과목들 = schedule.과목들.map(course => {
              // Find the corresponding course in our original data to get the real course_id
              const originalCourse = unregisteredCourses.find(c => 
                c.course_code === course.학수번호 || 
                c.course_name === course.과목_이름
              );
              
              if (originalCourse) {
                return {
                  ...course,
                  course_id: originalCourse.course_id
                };
              }
              
              return course; // Keep as is if not found
            });
          }
          
          return schedule;
        });
      } else {
        throw new Error("No valid schedules found in OpenAI response");
      }
      
      return new Response(
        JSON.stringify({ 
          schedules,
          coursesConsidered: unregisteredCourses.length,
          message: schedules.length > 0 ? undefined : '시간표를 생성할 수 없습니다. 다른 카테고리를 선택하거나 수강 내역을 확인해주세요.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (openaiError) {
      console.error("Error calling OpenAI:", openaiError);
      
      // Fallback to the original schedule generation logic if OpenAI fails
      console.log("Falling back to algorithm-based schedule generation");
      
      // Generate schedules using simple algorithm with strict time conflict checking
      const schedules = generateSchedules(unregisteredCourses, courseOverlapCheckPriority);
      
      return new Response(
        JSON.stringify({ 
          schedules,
          coursesConsidered: unregisteredCourses.length,
          message: schedules.length > 0 ? undefined : '시간표를 생성할 수 없습니다. 다른 카테고리를 선택하거나 수강 내역을 확인해주세요.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
  
  console.log(`Generating schedules from ${courses.length} available non-taken courses (미이수 과목)`);
  
  // Additional details about the course categories being used
  const categoryDistribution: Record<string, number> = {};
  courses.forEach(course => {
    categoryDistribution[course.category] = (categoryDistribution[course.category] || 0) + 1;
  });
  console.log("미이수 과목 카테고리 분포:", categoryDistribution);
  
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
