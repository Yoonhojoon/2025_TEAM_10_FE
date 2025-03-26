
import SchedulePlanner from "@/components/schedule/SchedulePlanner";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

interface ScheduleCourse {
  id: string;
  name: string;
  code: string;
  day: "mon" | "tue" | "wed" | "thu" | "fri";
  startTime: string;
  endTime: string;
  location: string;
  credit: number;
}

// Mock data for courses
const initialCourses: ScheduleCourse[] = [
  {
    id: uuidv4(),
    name: "컴퓨터 네트워크",
    code: "CS301",
    day: "mon",
    startTime: "10:00",
    endTime: "12:00",
    location: "공학관 401호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "데이터베이스",
    code: "CS302",
    day: "wed",
    startTime: "13:00",
    endTime: "15:00",
    location: "정보관 202호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "알고리즘",
    code: "CS303",
    day: "thu",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 305호",
    credit: 3
  }
];

const Schedule = () => {
  const [courses, setCourses] = useState<ScheduleCourse[]>(initialCourses);
  
  const handleAddCourse = (course: Omit<ScheduleCourse, "id">) => {
    const newCourse = {
      id: uuidv4(),
      ...course
    };
    setCourses([...courses, newCourse]);
  };
  
  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">시간표 계획</h1>
            <p className="text-muted-foreground">
              다음 학기 수강 계획을 세우고 최적의 시간표를 만드세요.
            </p>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <SchedulePlanner 
              courses={courses}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
