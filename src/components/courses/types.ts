
export interface Course {
  id: string;
  code: string;
  name: string;
  category: "majorRequired" | "majorElective" | "majorBasic" | "generalRequired" | "generalElective" | "industryRequired" | "basicGeneral";
  credit: number;
}

export interface DbCourse {
  course_id: string;
  course_code: string;
  course_name: string;
  category: "전공필수" | "전공선택" | "전공기초" | "배분이수교과" | "자유이수교과" | "산학필수" | "기초교과";
  credit: number;
  department_id: string;
  schedule_time: string;
  classroom: string | null;
}
