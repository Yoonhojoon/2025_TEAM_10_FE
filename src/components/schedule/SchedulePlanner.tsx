
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { AlertCircle, Clock, Copy, Plus, Save, Trash2 } from "lucide-react";
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

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const days = ["mon", "tue", "wed", "thu", "fri"];
const dayLabels = {
  mon: "월요일",
  tue: "화요일",
  wed: "수요일",
  thu: "목요일",
  fri: "금요일",
};

interface SchedulePlannerProps {
  courses: ScheduleCourse[];
  onAddCourse: (course: Omit<ScheduleCourse, "id">) => void;
  onDeleteCourse: (id: string) => void;
}

const SchedulePlanner = ({ 
  courses,
  onAddCourse,
  onDeleteCourse
}: SchedulePlannerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCourse, setNewCourse] = useState<Omit<ScheduleCourse, "id">>({
    name: "",
    code: "",
    day: "mon",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    credit: 3
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: name === "credit" ? parseInt(value) : value
    }));
  };
  
  const handleAddCourse = () => {
    onAddCourse(newCourse);
    setNewCourse({
      name: "",
      code: "",
      day: "mon",
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      credit: 3
    });
    setIsAdding(false);
  };
  
  // Helper to determine time slot position
  const getTimeSlotPosition = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    return hour - 9; // Assuming 9:00 is the first slot (position 0)
  };
  
  // Convert course to grid position
  const getCourseStyle = (course: ScheduleCourse) => {
    const dayIndex = days.indexOf(course.day);
    const startSlot = getTimeSlotPosition(course.startTime);
    const endSlot = getTimeSlotPosition(course.endTime);
    const duration = endSlot - startSlot;
    
    return {
      gridColumn: `${dayIndex + 2}`,
      gridRow: `${startSlot + 2} / span ${duration}`,
      backgroundColor: getCourseColor(course.code),
    };
  };
  
  // Generate pseudo-random pastel color based on course code
  const getCourseColor = (code: string) => {
    const seed = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = seed % 360;
    return `hsla(${hue}, 70%, 85%, 0.8)`;
  };
  
  // Check if the times conflict
  const hasTimeConflict = (newStart: string, newEnd: string, day: string) => {
    return courses.some(course => {
      if (course.day !== day) return false;
      
      const existingStart = getTimeSlotPosition(course.startTime);
      const existingEnd = getTimeSlotPosition(course.endTime);
      const newStartPos = getTimeSlotPosition(newStart);
      const newEndPos = getTimeSlotPosition(newEnd);
      
      return (
        (newStartPos >= existingStart && newStartPos < existingEnd) ||
        (newEndPos > existingStart && newEndPos <= existingEnd) ||
        (newStartPos <= existingStart && newEndPos >= existingEnd)
      );
    });
  };
  
  const timeConflict = hasTimeConflict(newCourse.startTime, newCourse.endTime, newCourse.day);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>시간표 계획</CardTitle>
          <CardDescription>수강할 과목을 계획해보세요</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            icon={<Copy size={16} />}
          >
            다른 계획 생성
          </Button>
          <Button 
            size="sm"
            icon={<Save size={16} />}
          >
            저장
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">2023년 2학기 시간표</h3>
          <Button 
            size="sm"
            variant="outline"
            icon={<Plus size={16} />}
            onClick={() => setIsAdding(true)}
          >
            과목 추가
          </Button>
        </div>
        
        {isAdding && (
          <div className="mb-6 p-4 rounded-lg border bg-secondary/30 animate-scale-in">
            <h4 className="font-medium mb-3">새 과목 추가</h4>
            {timeConflict && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">시간 충돌 발생</p>
                  <p className="text-sm">선택한 시간에 이미 다른 과목이 존재합니다.</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">과목 코드</label>
                <input
                  type="text"
                  name="code"
                  value={newCourse.code}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">과목명</label>
                <input
                  type="text"
                  name="name"
                  value={newCourse.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="프로그래밍 기초"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">요일</label>
                <select
                  name="day"
                  value={newCourse.day}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {Object.entries(dayLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">학점</label>
                <select
                  name="credit"
                  value={newCourse.credit}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="1">1학점</option>
                  <option value="2">2학점</option>
                  <option value="3">3학점</option>
                  <option value="4">4학점</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">시작 시간</label>
                <select
                  name="startTime"
                  value={newCourse.startTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {timeSlots.slice(0, -1).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">종료 시간</label>
                <select
                  name="endTime"
                  value={newCourse.endTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {timeSlots.slice(1).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">강의실</label>
                <input
                  type="text"
                  name="location"
                  value={newCourse.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="공학관 401호"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                취소
              </Button>
              <Button onClick={handleAddCourse} disabled={timeConflict}>
                추가
              </Button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[800px] grid grid-cols-[auto_repeat(5,_1fr)] grid-rows-[auto_repeat(11,_minmax(60px,_1fr))] gap-1 bg-secondary/30 rounded-lg p-2">
            {/* Header row with days */}
            <div className="bg-transparent h-12 flex items-center justify-center font-medium">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            {days.map(day => (
              <div 
                key={day} 
                className="bg-secondary h-12 rounded-md flex items-center justify-center font-medium"
              >
                {dayLabels[day as keyof typeof dayLabels]}
              </div>
            ))}
            
            {/* Time slots */}
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="bg-transparent flex items-center justify-center text-sm text-muted-foreground"
              >
                {time}
              </div>
            ))}
            
            {/* Empty cells for the grid */}
            {Array.from({ length: 55 }).map((_, index) => (
              <div
                key={`cell-${index}`}
                className="bg-card/70 rounded-md border border-border/50 min-h-[60px]"
              />
            ))}
            
            {/* Courses */}
            {courses.map((course) => (
              <div
                key={course.id}
                style={getCourseStyle(course)}
                className="absolute rounded-md border border-primary/20 shadow-sm p-2 overflow-hidden transition-all hover:shadow-md z-10"
              >
                <div className="font-medium text-sm truncate">{course.name}</div>
                <div className="text-xs text-foreground/70 mt-1 truncate">{course.location}</div>
                <div className="text-xs text-foreground/70 truncate">
                  {course.startTime} - {course.endTime}
                </div>
                <button
                  onClick={() => onDeleteCourse(course.id)}
                  className="absolute top-1 right-1 text-foreground/40 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">등록된 과목 (총 {courses.reduce((acc, course) => acc + course.credit, 0)}학점)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {courses.map(course => (
              <div 
                key={course.id} 
                className="p-3 rounded-lg border"
                style={{ borderLeftColor: getCourseColor(course.code), borderLeftWidth: '4px' }}
              >
                <div className="font-medium">{course.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {dayLabels[course.day as keyof typeof dayLabels]} {course.startTime}-{course.endTime}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">{course.credit}학점</span>
                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="md:col-span-3 p-6 text-center text-muted-foreground border rounded-lg">
                아직 등록된 과목이 없습니다. 과목을 추가해주세요.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulePlanner;
