
export interface ScheduleCourse {
  id: string;
  name: string;
  code: string;
  day: "mon" | "tue" | "wed" | "thu" | "fri";
  startTime: string;
  endTime: string;
  location: string;
  credit: number;
  fromHistory?: boolean;
  schedule_time?: string;
}

export type CourseCategory = "전공필수" | "전공선택" | "전공기초" | "배분이수교과" | "자유이수교과" | "산학필수" | "기초교과";

export interface CourseData {
  course_id: string;
  course_name?: string;
  course_code?: string;
  과목_이름?: string;
  학수번호?: string;
  credit?: number;
  학점?: number;
  schedule_time?: string;
  강의_시간?: string;
  classroom?: string;
  강의실?: string;
  category?: CourseCategory;
}

export interface GeneratedSchedule {
  name: string;
  태그?: string[];
  과목들?: CourseData[];
  courses?: CourseData[];
  총_학점?: number;
  total_credits?: number;
  설명?: string;
  description?: string;
}

export interface SavedSchedule {
  schedule_id: string;
  created_at: string;
  description_tags: string[] | null;
  schedule_json: GeneratedSchedule;
  user_id?: string;
}

export interface TimeConflict {
  courseA: string;
  courseB: string;
  day: string;
  timeA: string;
  timeB: string;
}

export interface ConsolidatedCourse extends ScheduleCourse {
  scheduleTimes: {
    id: string;
    day: "mon" | "tue" | "wed" | "thu" | "fri";
    startTime: string;
    endTime: string;
  }[];
}
