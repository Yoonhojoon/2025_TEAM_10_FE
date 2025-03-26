
import CourseHistoryInput from "@/components/courses/CourseHistoryInput";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface Course {
  id: string;
  code: string;
  name: string;
  category: "majorRequired" | "majorElective" | "generalRequired" | "generalElective";
  credit: number;
  semester: string;
  grade: string;
}

// Mock data for courses
const initialCourses: Course[] = [
  {
    id: uuidv4(),
    code: "CS101",
    name: "컴퓨터 프로그래밍 기초",
    category: "majorRequired",
    credit: 3,
    semester: "2021-1",
    grade: "A+"
  },
  {
    id: uuidv4(),
    code: "MATH201",
    name: "공학수학",
    category: "majorRequired",
    credit: 3,
    semester: "2021-2",
    grade: "B+"
  },
  {
    id: uuidv4(),
    code: "ENG102",
    name: "영어회화",
    category: "generalRequired",
    credit: 2,
    semester: "2021-1",
    grade: "A"
  },
  {
    id: uuidv4(),
    code: "CS202",
    name: "자료구조",
    category: "majorRequired",
    credit: 3,
    semester: "2022-1",
    grade: "A"
  },
  {
    id: uuidv4(),
    code: "HIST101",
    name: "세계사의 이해",
    category: "generalElective",
    credit: 2,
    semester: "2022-1",
    grade: "B"
  }
];

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  
  const handleAddCourse = (course: Omit<Course, "id">) => {
    const newCourse = {
      id: uuidv4(),
      ...course
    };
    setCourses([newCourse, ...courses]);
  };
  
  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };
  
  const handleUpdateCourse = (id: string, updatedCourse: Partial<Course>) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, ...updatedCourse } : course
    ));
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">수강 기록</h1>
            <p className="text-muted-foreground">
              지금까지 수강한 과목을 관리하고 졸업 요건 충족 상황을 확인하세요.
            </p>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CourseHistoryInput 
              courses={courses}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
              onUpdateCourse={handleUpdateCourse}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
