
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userId, takenCourseIds } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    );

    // Get user information to determine department
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('department_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const departmentId = userData.department_id;

    // Get all courses for the user's department
    const { data: availableCourses, error: coursesError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('department_id', departmentId);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch available courses' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out courses the user has already taken
    const unregisteredCourses = availableCourses.filter(course => 
      !takenCourseIds.includes(course.course_id)
    );

    if (unregisteredCourses.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No unregistered courses found for your department', schedules: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${unregisteredCourses.length} unregistered courses for user's department`);

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

      아래 형식으로 JSON 응답만 제공해주세요(추가 텍스트 없이):
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
    `;

    // Call OpenAI API
    console.log('Calling OpenAI API to generate schedules');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: promptContent
          }
        ],
        temperature: 0.7
      })
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', openAIData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate schedules with OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process and return the generated schedules
    const generatedContent = openAIData.choices[0].message.content;
    console.log('Generated content:', generatedContent);
    
    // Try to parse the JSON response from OpenAI
    try {
      // Clean up the response if it contains markdown code blocks or any other unnecessary characters
      let cleanContent = generatedContent;
      
      // Remove markdown code block syntax if present
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n|\n```/g, '');
      } else if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```\n|\n```/g, '');
      }
      
      // Additional cleanup for any leading/trailing whitespace
      cleanContent = cleanContent.trim();
      
      const schedulesData = JSON.parse(cleanContent);
      
      // Map the course IDs back to the actual course IDs from our database
      if (schedulesData.schedules) {
        schedulesData.schedules.forEach(schedule => {
          if (schedule.과목들) {
            schedule.과목들.forEach(course => {
              // Find the matching course in our unregistered courses
              const matchingCourse = unregisteredCourses.find(
                dbCourse => dbCourse.course_code === course.학수번호 || dbCourse.course_name === course.과목_이름
              );
              
              if (matchingCourse) {
                course.course_id = matchingCourse.course_id;
              }
            });
          }
        });
        
        // Now save each schedule to the schedules table
        const savePromises = schedulesData.schedules.map(async (schedule) => {
          // Extract tags from the schedule
          const tags = schedule.태그 || [];
          
          // Create schedule data for DB
          const scheduleData = {
            user_id: userId,
            schedule_json: schedule,
            description_tags: tags
          };
          
          // Insert the schedule into the database
          const { data, error } = await supabaseClient
            .from('schedules')
            .insert(scheduleData);
            
          if (error) {
            console.error('Error saving schedule to database:', error);
          }
          
          return { data, error };
        });
        
        // Wait for all save operations to complete
        await Promise.all(savePromises);
      }
      
      return new Response(
        JSON.stringify(schedulesData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, 'Raw response:', generatedContent);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse schedule data from OpenAI',
          raw_response: generatedContent 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error in generate-schedules function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
