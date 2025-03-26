
import SchedulePlanner from "@/components/schedule/SchedulePlanner";
import GraduationRequirements from "@/components/schedule/GraduationRequirements";
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

// Mock data for courses - Deliberately creating problematic schedule 
// to demonstrate error cases
const initialCourses: ScheduleCourse[] = [
  {
    id: uuidv4(),
    name: "컴퓨터 네트워크",
    code: "COMEENG301",
    day: "mon",
    startTime: "10:00",
    endTime: "12:00",
    location: "공학관 401호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "데이터베이스",
    code: "COMEENG302",
    day: "wed",
    startTime: "13:00",
    endTime: "15:00",
    location: "정보관 202호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "알고리즘",
    code: "COMEENG303",
    day: "thu",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 305호",
    credit: 3
  },
  // 같은 시간대 다른 요일에 수업 (불가능한 시간표 예시)
  {
    id: uuidv4(),
    name: "운영체제",
    code: "COMEENG304",
    day: "tue",
    startTime: "10:00",
    endTime: "12:00",
    location: "공학관 505호",
    credit: 3
  },
  // 같은 날 너무 많은 수업
  {
    id: uuidv4(),
    name: "인공지능",
    code: "COMEENG401",
    day: "mon",
    startTime: "13:00",
    endTime: "15:00",
    location: "공학관 605호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "머신러닝",
    code: "COMEENG402",
    day: "mon",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 606호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "딥러닝",
    code: "COMEENG403",
    day: "mon",
    startTime: "17:00",
    endTime: "19:00",
    location: "공학관 607호",
    credit: 3
  },
  // 학점 초과를 위한 추가 과목들
  {
    id: uuidv4(),
    name: "캡스톤디자인",
    code: "COMEENG501",
    day: "fri",
    startTime: "10:00",
    endTime: "13:00",
    location: "공학관 701호",
    credit: 3
  },
  {
    id: uuidv4(),
    name: "IoT 프로그래밍",
    code: "COMEENG502",
    day: "wed",
    startTime: "15:00",
    endTime: "17:00",
    location: "공학관 702호",
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
            <GraduationRequirements />
            
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
