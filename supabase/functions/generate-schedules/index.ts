
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

    // Get user information to determine grade level
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('grade, department_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userGrade = userData.grade;
    const departmentId = userData.department_id;

    // Get all courses for the user's grade and grade+1 in their department
    const { data: availableCourses, error: coursesError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .in('grade', [userGrade, userGrade + 1]);

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
        JSON.stringify({ message: 'No unregistered courses found for your grade level', schedules: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${unregisteredCourses.length} unregistered courses for grade ${userGrade} and ${userGrade + 1}`);

    // Prepare the prompt for OpenAI
    const promptContent = `
      I need to create 3 different optimal class schedules using these available courses:
      ${unregisteredCourses.map(course => 
        `- ${course.course_name} (${course.course_code}): ${course.credit} credits, Schedule: ${course.schedule_time}, Room: ${course.classroom || 'TBA'}`
      ).join('\n')}

      Rules for creating schedules:
      1. Classes must not have time conflicts
      2. Each schedule should have between 15-21 total credits
      3. Try to balance the courses across different days
      4. Include a variety of course types if possible

      Respond with exactly 3 schedules in this JSON format:
      {
        "schedules": [
          {
            "name": "Schedule Option 1",
            "courses": [
              {
                "course_id": "[course_id]",
                "course_name": "[course_name]",
                "course_code": "[course_code]",
                "credit": [credit],
                "schedule_time": "[schedule_time]",
                "classroom": "[classroom]"
              }
            ],
            "total_credits": [sum of credits],
            "description": "[brief description of this schedule's advantages]"
          }
        ]
      }

      Only include valid JSON in your response, no additional text.
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
    
    // Try to parse the JSON response from OpenAI
    try {
      const schedulesData = JSON.parse(generatedContent);
      
      // Map the course IDs back to the actual course IDs from our database
      // This ensures we use the correct IDs when adding to the schedule
      if (schedulesData.schedules) {
        schedulesData.schedules.forEach(schedule => {
          if (schedule.courses) {
            schedule.courses.forEach(course => {
              // Find the matching course in our unregistered courses
              const matchingCourse = unregisteredCourses.find(
                dbCourse => dbCourse.course_code === course.course_code
              );
              
              if (matchingCourse) {
                course.course_id = matchingCourse.course_id;
              }
            });
          }
        });
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
