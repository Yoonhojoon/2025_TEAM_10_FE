
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
    
    // Prepare the prompt for OpenAI with the specific format requested
    const promptContent = `
      나는 다음 과목들을 사용하여 3개의 최적의 수업 시간표를 만들고 싶습니다:
      ${unregisteredCourses.map(course => 
        `- ${course.course_name} (${course.course_code}): ${course.credit}학점, 시간: ${course.schedule_time}, 장소: ${course.classroom || '미정'}`
      ).join('\n')}

      시간표 생성 규칙:
      1. 수업 시간이 겹치지 않아야 함 (과목 요일과 시간을 정확히 확인해서, 절대 겹치는 시간표가 없게 확인해)
      2. 각 시간표는 15-21학점 사이여야 함
      3. 수업이 다양한 요일에 골고루 분산되도록 함
      4. 가능하면 다양한 과목 유형을 포함해야 함
      5. 매우 중요: 각 시간표마다 포함된 모든 과목 시간을 꼼꼼히 검토하고, 같은 요일에 수업 시간대가 겹치는 과목이 절대 없도록 해야 함. 예를 들어, 월요일 10:00-12:00 수업과 월요일 11:00-13:00 수업은 겹치므로 같은 시간표에 포함될 수 없음
      6. 매우 중요: 완전히 같은 시간에 있는 수업들(예: 월요일 10:00-12:00와 월요일 10:00-12:00)은 같은 시간표에 절대 포함될 수 없음

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
          model: "gpt-4-turbo",
          messages: [
            {"role": "system", "content": "You are a helpful assistant that can generate optimal class schedules."},
            {"role": "user", "content": promptContent}
          ],
          temperature: 0.7
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
      } else {
        throw new Error("Unexpected response format from OpenAI");
      }
      
      console.log(`Successfully generated ${generatedSchedules.length} schedules using OpenAI`);
      
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
