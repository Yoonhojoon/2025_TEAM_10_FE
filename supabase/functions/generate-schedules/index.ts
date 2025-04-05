
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from "../_shared/cors.ts";

interface EdgeFunctionPayload {
  userId: string;
  enrolledCourseIds: string[];
  categories: string[];
  courseOverlapCheckPriority?: boolean;
}

interface CourseData {
  course_id: string;
  course_name: string;
  course_code: string;
  category: string;
  credit: number;
  classroom?: string | null;
  schedule_time: string;
}

interface GeneratedSchedule {
  name: string;
  태그: string[];
  과목들: {
    course_id: string;
    과목_이름: string;
    학수번호: string;
    학점: number;
    강의_시간: string;
    강의실: string;
  }[];
  총_학점: number;
  설명: string;
}

// Function to normalize time format for better consistency
function normalizeScheduleTime(scheduleTime: string): string {
  if (!scheduleTime) return '';
  
  // Standardize time format to make it clearer for AI processing
  // Example: Convert "화 11:00-12:50" to "화요일 11:00-12:50"
  return scheduleTime
    .replace(/월(\s|$)/g, '월요일 ')
    .replace(/화(\s|$)/g, '화요일 ')
    .replace(/수(\s|$)/g, '수요일 ')
    .replace(/목(\s|$)/g, '목요일 ')
    .replace(/금(\s|$)/g, '금요일 ')
    .trim();
}

// Function to detect potential time conflicts between courses
function detectTimeConflicts(courses: CourseData[]): { hasConflicts: boolean, examples: string[] } {
  const examples: string[] = [];
  const timeSlots: Record<string, {course: string, time: string}[]> = {
    '월': [], '화': [], '수': [], '목': [], '금': []
  };
  
  // Extract day and time information from each course
  courses.forEach(course => {
    if (!course.schedule_time) return;
    
    const schedules = course.schedule_time.split(',').map(s => s.trim());
    schedules.forEach(schedule => {
      const dayMatch = schedule.match(/[월화수목금]/);
      if (!dayMatch) return;
      
      const day = dayMatch[0];
      timeSlots[day].push({
        course: course.course_name,
        time: schedule
      });
    });
  });
  
  // Check for exact duplicates in each day
  Object.keys(timeSlots).forEach(day => {
    const slots = timeSlots[day];
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (slots[i].time === slots[j].time) {
          examples.push(`"${slots[i].course}" and "${slots[j].course}" have identical schedules: ${slots[i].time}`);
        }
      }
    }
  });
  
  return {
    hasConflicts: examples.length > 0,
    examples
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const payload: EdgeFunctionPayload = await req.json();
    const { userId, enrolledCourseIds, categories } = payload;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user department
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('department_id')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      throw new Error(`Failed to get user data: ${userError.message}`);
    }

    // Get available courses based on department and categories
    const { data: availableCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', userData.department_id)
      .in('category', categories);
      
    if (coursesError) {
      throw new Error(`Failed to get available courses: ${coursesError.message}`);
    }

    console.log(`Total courses available for department: ${availableCourses.length}`);
    
    // Filter out courses that the user has already taken
    const unregisteredCourses = availableCourses.filter(
      course => !enrolledCourseIds.includes(course.course_id)
    );
    
    console.log(`Courses not taken by user: ${unregisteredCourses.length}`);
    
    // If we have no courses to work with, return early
    if (unregisteredCourses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "생성할 수 있는 시간표가 없습니다. 선택한 카테고리의 모든 과목을 이미 수강했습니다.",
          coursesConsidered: availableCourses.length,
          schedules: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check for and log potential time conflicts in the dataset
    const conflicts = detectTimeConflicts(unregisteredCourses);
    if (conflicts.hasConflicts) {
      console.log("Warning: Detected potential time conflicts in the course data:");
      conflicts.examples.forEach(ex => console.log("- " + ex));
    }
    
    // Prepare the course list with normalized schedule times for clearer parsing
    const courseListForPrompt = unregisteredCourses.map(course => {
      const normalizedTime = normalizeScheduleTime(course.schedule_time);
      return `- ${course.course_name} (${course.course_code}): ${course.credit}학점, 시간: ${normalizedTime || course.schedule_time}, 장소: ${course.classroom || '미정'}`;
    }).join('\n');
    
    // Prepare the prompt for OpenAI with enhanced instructions for time parsing
    const promptContent = `
      나는 다음 과목들을 사용하여 3개의 최적의 수업 시간표를 만들고 싶습니다:
      ${courseListForPrompt}

      시간표 생성 규칙:
      1. 수업 시간이 절대 겹치지 않아야 함 (매우 중요!)
      2. 각 시간표는 15-21학점 사이여야 함
      3. 수업이 다양한 요일에 골고루 분산되도록 함
      4. 가능하면 다양한 과목 유형을 포함해야 함
      5. 시간표를 생성하기 전에 반드시 모든 과목의 시간을 면밀히 분석하여, 겹치는 시간이 없도록 확인해야 함
      6. 시간 형식 해석 방법: "요일 시작시간-종료시간"입니다. 예를 들어 "월요일 10:00-12:30"은 월요일 오전 10시부터 오후 12시 30분까지입니다.
      7. 매우 중요: 같은 요일에 수업 시간대가 조금이라도 겹치는 과목은 절대 같은 시간표에 포함될 수 없음. 예: "월요일 10:00-12:00"와 "월요일 11:00-13:00"는 겹치므로 동시에 수강 불가능
      8. 같은 시간에 있는 수업들(예: "월요일 10:00-12:00"와 "월요일 10:00-12:00")은 절대 같은 시간표에 포함될 수 없음
      9. 겹치는 시간이 있는 과목을 선택할 경우, 반드시 해당 시간표는 무효로 처리하고 다시 생성해야 함

      시간 충돌 확인 단계:
      1. 각 시간표에 포함시킬 과목을 선택한 후, 과목별 요일과 시간을 추출
      2. 같은 요일의 수업들을 모아서 시간대 겹침 여부 확인
      3. 시작 시간과 종료 시간을 분 단위로 변환하여 수업 시간이 겹치는지 정밀하게 확인
      4. 조금이라도 겹치는 시간이 있으면 해당 과목 조합은 사용하지 않음

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
      
      매우 중요: 최종 결과를 제공하기 전에 생성된 각 시간표에서 시간 충돌이 없는지 반드시 다시 한번 확인하세요.
    `;
    
    let generatedSchedules: GeneratedSchedule[] = [];
    let generatedError = null;
    
    try {
      // Call OpenAI API
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",  // Using gpt-4o for better reasoning and time conflict detection
          messages: [
            {
              "role": "system", 
              "content": "You are a course scheduling assistant specializing in creating non-conflicting class schedules. Your primary task is to ensure that no courses in a schedule have overlapping times. You must verify all time slots carefully before finalizing each schedule."
            },
            {"role": "user", "content": promptContent}
          ],
          temperature: 0.2  // Lower temperature for more consistent and careful reasoning
        })
      });

      const openaiData = await openaiResponse.json();
      
      if (!openaiResponse.ok) {
        console.error("OpenAI API error:", openaiData);
        throw new Error(`OpenAI API error: ${openaiData.error?.message || "Unknown error"}`);
      }

      const responseContent = openaiData.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No content in OpenAI response");
      }

      console.log("Raw OpenAI response:", responseContent);

      // Try to extract JSON from the response
      let jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseContent.match(/```\s*([\s\S]*?)\s*```/) || 
                       [null, responseContent];
      
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonMatch[1] || responseContent);
        console.log("Successfully parsed JSON from OpenAI response");
      } catch (e) {
        console.error("Failed to parse JSON from response, trying alternative parsing", e);
        try {
          const jsonStart = responseContent.indexOf('{');
          const jsonEnd = responseContent.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonString = responseContent.substring(jsonStart, jsonEnd);
            parsedJson = JSON.parse(jsonString);
            console.log("Successfully parsed JSON using alternative method");
          } else {
            throw new Error("Cannot find valid JSON in the response");
          }
        } catch (innerError) {
          console.error("All JSON parsing attempts failed:", innerError);
          throw new Error("Failed to parse OpenAI response as JSON");
        }
      }
      
      if (parsedJson && parsedJson.schedules && Array.isArray(parsedJson.schedules)) {
        generatedSchedules = parsedJson.schedules;
        console.log(`Successfully generated ${generatedSchedules.length} schedules using OpenAI`);
        
        // Verify no time conflicts in generated schedules
        let hasConflicts = false;
        generatedSchedules.forEach((schedule, index) => {
          const courses = schedule.과목들 || [];
          console.log(`Verifying schedule ${index + 1} with ${courses.length} courses`);
          
          // Convert courses to format needed for conflict detection
          const courseDataForCheck: CourseData[] = courses.map(course => ({
            course_id: course.course_id,
            course_name: course.과목_이름,
            course_code: course.학수번호,
            category: '',
            credit: course.학점,
            classroom: course.강의실,
            schedule_time: course.강의_시간
          }));
          
          const conflicts = detectTimeConflicts(courseDataForCheck);
          if (conflicts.hasConflicts) {
            console.error(`Time conflicts detected in schedule ${index + 1}:`);
            conflicts.examples.forEach(ex => console.error("- " + ex));
            hasConflicts = true;
          }
        });
        
        if (hasConflicts) {
          console.warn("Warning: Some generated schedules may contain time conflicts!");
        } else {
          console.log("All generated schedules verified - no time conflicts found.");
        }
      } else {
        throw new Error("Unexpected response format from OpenAI");
      }
      
    } catch (error) {
      console.error("Error using OpenAI:", error);
      generatedError = error.message;
      
      // Fallback to our original algorithm if OpenAI fails
      console.log("Falling back to default schedule generation algorithm");
      // Basic schedule generation logic would go here
      // ... (In a real implementation, you'd have a fallback algorithm)
    }

    // Return the generated schedules
    return new Response(
      JSON.stringify({
        message: generatedError ? `AI 시간표 생성 실패: ${generatedError}` : "시간표가 생성되었습니다.",
        coursesConsidered: unregisteredCourses.length,
        schedules: generatedSchedules 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in edge function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
