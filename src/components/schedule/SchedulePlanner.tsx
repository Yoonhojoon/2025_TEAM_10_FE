import React, { useState } from "react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { AlertCircle, Clock, Eye, Save, Trash2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleCourse {
  id: string;
  name: string;
  code: string;
  day: "mon" | "tue" | "wed" | "thu" | "fri";
  startTime: string;
  endTime: string;
  location: string;
  credit: number;
  fromHistory?: boolean;
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
  onAddCourse: (course: Omit<ScheduleCourse, "id">) => Promise<boolean>;
  onDeleteCourse: (id: string) => void;
  onViewOtherSchedules?: () => void;
}

const MAX_CREDITS_PER_SEMESTER = 21;
const MIN_CREDITS_PER_SEMESTER = 12;
const MAX_COURSES_PER_DAY = 4;

const SchedulePlanner = ({ 
  courses,
  onAddCourse,
  onDeleteCourse,
  onViewOtherSchedules
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
  const [isCheckingPrerequisites, setIsCheckingPrerequisites] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: name === "credit" ? parseInt(value) : value
    }));
  };
  
  const handleAddCourse = async () => {
    const timeConflict = hasTimeConflict(newCourse.startTime, newCourse.endTime, newCourse.day);
    const creditOverload = wouldExceedCreditLimit(newCourse.credit);
    const courseOverload = wouldExceedDailyCourseLimit(newCourse.day);
    
    if (timeConflict) {
      toast({
        title: "시간 충돌",
        description: "선택한 시간에 이미 다른 과목이 존재합니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (creditOverload) {
      toast({
        title: "학점 초과",
        description: `학기당 최대 ${MAX_CREDITS_PER_SEMESTER}학점을 초과할 수 없습니다.`,
        variant: "destructive"
      });
      return;
    }
    
    if (courseOverload) {
      toast({
        title: "하루 과목 수 초과",
        description: `${dayLabels[newCourse.day as keyof typeof dayLabels]}에 이미 ${MAX_COURSES_PER_DAY}개의 과목이 있습니다.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckingPrerequisites(true);
    
    try {
      const success = await onAddCourse(newCourse);
      
      if (success) {
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
        
        toast({
          title: "과목 추가 완료",
          description: `${newCourse.name} 과목이 시간표에 추가되었습니다.`
        });
      }
    } finally {
      setIsCheckingPrerequisites(false);
    }
  };
  
  const getTimeSlotPosition = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    return hour - 9;
  };
  
  const getCourseStyle = (course: ScheduleCourse) => {
    const startHour = parseInt(course.startTime.split(":")[0]);
    const endHour = parseInt(course.endTime.split(":")[0]);
    
    const startPos = startHour - 9;
    const duration = endHour - startHour;
    
    const dayIndex = days.indexOf(course.day);
    
    return {
      gridColumn: dayIndex + 1,
      gridRow: `${startPos + 1} / span ${duration}`,
      backgroundColor: getCourseColor(course),
      width: "100%",
      height: "100%",
      margin: "2px 0",
    };
  };
  
  const getCourseColor = (course: ScheduleCourse) => {
    if (course.fromHistory) {
      const seed = course.code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const lightness = 65 + (seed % 20);
      return `hsla(330, 85%, ${lightness}%, 0.8)`;
    }
    
    const seed = course.code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = seed % 360;
    return `hsla(${hue}, 70%, 85%, 0.8)`;
  };
  
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
  
  const wouldExceedCreditLimit = (additionalCredits: number) => {
    const currentCredits = courses.reduce((total, course) => total + course.credit, 0);
    return currentCredits + additionalCredits > MAX_CREDITS_PER_SEMESTER;
  };
  
  const wouldExceedDailyCourseLimit = (day: string) => {
    const coursesForDay = courses.filter(course => course.day === day);
    return coursesForDay.length >= MAX_COURSES_PER_DAY;
  };
  
  const timeConflict = hasTimeConflict(newCourse.startTime, newCourse.endTime, newCourse.day);
  const creditOverload = wouldExceedCreditLimit(newCourse.credit);
  const courseOverload = wouldExceedDailyCourseLimit(newCourse.day);
  
  const hasDuplicateTimes = courses.some((course1, index) => {
    return courses.some((course2, idx) => {
      if (index === idx) return false;
      return course1.startTime === course2.startTime && 
             course1.endTime === course2.endTime && 
             course1.day !== course2.day;
    });
  });
  
  const coursesPerDay = days.reduce((acc, day) => {
    acc[day] = courses.filter(course => course.day === day).length;
    return acc;
  }, {} as Record<string, number>);
  
  const totalCredits = courses.reduce((total, course) => total + course.credit, 0);
  const isBelowRecommendedCredits = totalCredits < MIN_CREDITS_PER_SEMESTER && courses.length > 0;
  
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
            icon={<Eye size={16} />}
            onClick={onViewOtherSchedules}
          >
            다른 계획 보기
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
          <h3 className="text-lg font-medium">2025년 2학기 시간표</h3>
        </div>
        
        {(hasDuplicateTimes || isBelowRecommendedCredits || totalCredits > MAX_CREDITS_PER_SEMESTER) && (
          <Alert className="mb-4" variant={totalCredits > MAX_CREDITS_PER_SEMESTER ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>시간표 문제 발견</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {hasDuplicateTimes && (
                  <li>동일한 시간대에 다른 요일에 수업이 있습니다. 이는 불가능한 시간표입니다.</li>
                )}
                {isBelowRecommendedCredits && (
                  <li>현재 {totalCredits}학점으로 한 학기 권장 최소학점({MIN_CREDITS_PER_SEMESTER}학점)보다 적습니다.</li>
                )}
                {totalCredits > MAX_CREDITS_PER_SEMESTER && (
                  <li>총 {totalCredits}학점으로 한 학기 최대학점({MAX_CREDITS_PER_SEMESTER}학점)을 초과했습니다.</li>
                )}
                {Object.entries(coursesPerDay).map(([day, count]) => (
                  count > MAX_COURSES_PER_DAY - 1 && (
                    <li key={day}>
                      {dayLabels[day as keyof typeof dayLabels]}에 과목 수({count}개)가 많습니다. 하루에 {MAX_COURSES_PER_DAY}개 이하가 권장됩니다.
                    </li>
                  )
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {isAdding && (
          <div className="mb-6 p-4 rounded-lg border bg-secondary/30 animate-scale-in">
            <h4 className="font-medium mb-3">새 과목 추가</h4>
            {(timeConflict || creditOverload || courseOverload) && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">다음 문제가 있습니다:</p>
                  <ul className="pl-5 list-disc mt-1 space-y-1">
                    {timeConflict && <li>시간 충돌: 선택한 시간에 이미 다른 과목이 존재합니다.</li>}
                    {creditOverload && <li>학점 초과: 학기당 최대 {MAX_CREDITS_PER_SEMESTER}학점을 초과할 수 없습니다.</li>}
                    {courseOverload && <li>과목 수 초과: {dayLabels[newCourse.day as keyof typeof dayLabels]}에 이미 {MAX_COURSES_PER_DAY}개의 과목이 있습니다.</li>}
                  </ul>
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
              <Button 
                onClick={handleAddCourse} 
                disabled={
                  isCheckingPrerequisites || 
                  timeConflict || 
                  creditOverload || 
                  courseOverload || 
                  !newCourse.name || 
                  !newCourse.code
                }
              >
                {isCheckingPrerequisites ? "확인 중..." : "추가"}
              </Button>
            </div>
          </div>
        )}
        
        <div className="overflow-auto pb-2">
          <div className="min-w-[800px] border rounded-lg bg-secondary/30 p-2 overflow-hidden">
            <div 
              className="grid relative"
              style={{ 
                gridTemplateColumns: "80px repeat(5, 1fr)",
                gridTemplateRows: "auto repeat(11, 60px)",
                gap: "1px"
              }}
            >
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
              
              {timeSlots.map((time, index) => (
                <React.Fragment key={`row-${time}`}>
                  <div className="bg-transparent flex items-center justify-start pt-1 pl-2 text-sm text-muted-foreground">
                    {time}
                  </div>
                  
                  {days.map(day => (
                    <div
                      key={`cell-${day}-${time}`}
                      className="bg-card/70 rounded-md border border-border/50 h-full"
                    />
                  ))}
                </React.Fragment>
              ))}
              
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
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">등록된 과목 (총 {courses.reduce((total, course) => total + course.credit, 0)}학점)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {courses.map(course => (
              <div 
                key={course.id} 
                className="p-3 rounded-lg border"
                style={{ 
                  borderLeftColor: getCourseColor(course), 
                  borderLeftWidth: '4px',
                  backgroundColor: course.fromHistory ? 'rgba(253, 242, 248, 0.3)' : undefined
                }}
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
            {!isAdding && courses.length < 10 && (
              <button
                onClick={() => setIsAdding(true)}
                className="p-6 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                + 과목 추가하기
              </button>
            )}
            {courses.length === 0 && !isAdding && (
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
