
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, PlusCircle, Trash2, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScheduleCourse } from "@/hooks/useSchedule";

interface Course {
  id: string;
  code: string;
  name: string;
  category: "majorRequired" | "majorElective" | "generalRequired" | "generalElective";
  credit: number;
}

interface CourseHistoryInputProps {
  onAddCourse: (course: any) => void;
  courses?: Course[];
  onDeleteCourse?: (id: string) => void;
  isLoading?: boolean;
}

interface DbCourse {
  course_id: string;
  course_code: string;
  course_name: string;
  category: "전공필수" | "전공선택" | "전공기초" | "배분이수교과" | "자유이수교과";
  credit: number;
  department_id: string;
  schedule_time: string;
  classroom: string | null;
}

const CourseHistoryInput = ({ 
  onAddCourse,
  courses = [],
  onDeleteCourse = () => {},
  isLoading = false
}: CourseHistoryInputProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCourse, setNewCourse] = useState<Omit<Course, "id">>({
    code: "",
    name: "",
    category: "majorRequired",
    credit: 3
  });
  const [dbCourses, setDbCourses] = useState<DbCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserDepartment = async () => {
      if (!user) return;
      
      setDepartmentError(null);
      console.log("Fetching department for user ID:", user.id);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('department_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching user department:", error);
          throw error;
        }
        
        if (data && data.department_id) {
          console.log("Found user department ID:", data.department_id);
          setUserDepartmentId(data.department_id);
          
          const { data: deptData, error: deptError } = await supabase
            .from('departments')
            .select('department_name')
            .eq('department_id', data.department_id)
            .single();
            
          if (!deptError && deptData) {
            console.log("Department name:", deptData.department_name);
          }
        } else {
          console.log("No department found for user:", user.id);
          setDepartmentError("사용자의 학과 정보를 찾을 수 없습니다. 프로필 설정을 완료해주세요.");
        }
      } catch (error) {
        console.error('Error fetching user department:', error);
        setDepartmentError("학과 정보를 불러오는 데 문제가 발생했습니다.");
      }
    };
    
    fetchUserDepartment();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: name === "credit" ? parseInt(value) : value
    }));
  };
  
  const handleAddCourse = () => {
    const adaptedCourse: Omit<ScheduleCourse, "id"> = {
      name: newCourse.name,
      code: newCourse.code,
      credit: newCourse.credit,
      day: "mon",
      startTime: "10:00",
      endTime: "12:00",
      location: "미정",
      fromHistory: true
    };
    
    onAddCourse(adaptedCourse);
    
    setNewCourse({
      code: "",
      name: "",
      category: "majorRequired",
      credit: 3
    });
    setIsAdding(false);
  };
  
  const handleNavigateToSchedule = () => {
    navigate('/schedule');
    toast({
      title: "시간표 생성",
      description: "시간표 생성 페이지로 이동했습니다.",
      duration: 3000,
    });
  };

  const fetchCourses = async (tabValue: string) => {
    setDbCourses([]);
    setIsLoadingCourses(true);
    
    try {
      let query = supabase.from('courses').select('*');
      
      if (tabValue === "major-required" && userDepartmentId) {
        query = query
          .eq('department_id', userDepartmentId)
          .in('category', ['전공필수', '전공기초']);
          
        console.log("Fetching major required courses for department:", userDepartmentId);
      } else if (tabValue === "major-elective" && userDepartmentId) {
        query = query
          .eq('department_id', userDepartmentId)
          .eq('category', '전공선택');
          
        console.log("Fetching major elective courses for department:", userDepartmentId);
      } else if (tabValue === "general-required") {
        query = query.eq('category', '배분이수교과');
      } else if (tabValue === "general-elective") {
        query = query.eq('category', '자유이수교과');
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log(`Fetched ${data.length} courses for ${tabValue}`);
        setDbCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "오류 발생",
        description: "과목 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const selectCourseFromDb = (course: DbCourse) => {
    const mappedCategory = (): "majorRequired" | "majorElective" | "generalRequired" | "generalElective" => {
      switch (course.category) {
        case "전공필수":
        case "전공기초":
          return "majorRequired";
        case "전공선택":
          return "majorElective";
        case "배분이수교과":
          return "generalRequired";
        case "자유이수교과":
          return "generalElective";
        default:
          return "generalElective";
      }
    };

    const scheduleTimeInfo = course.schedule_time.split(' ');
    let day: "mon" | "tue" | "wed" | "thu" | "fri" = "mon";
    let startTime = "10:00";
    let endTime = "12:00";
    
    if (scheduleTimeInfo.length >= 2) {
      const dayMapping: Record<string, "mon" | "tue" | "wed" | "thu" | "fri"> = {
        "월": "mon", "화": "tue", "수": "wed", "목": "thu", "금": "fri",
        "mon": "mon", "tue": "tue", "wed": "wed", "thu": "thu", "fri": "fri"
      };
      
      day = dayMapping[scheduleTimeInfo[0].toLowerCase()] || "mon";
      
      const timeRange = scheduleTimeInfo[1].split('-');
      if (timeRange.length === 2) {
        startTime = timeRange[0];
        endTime = timeRange[1];
      }
    }

    const adaptedCourse: Omit<ScheduleCourse, "id"> = {
      name: course.course_name,
      code: course.course_code,
      credit: course.credit,
      day: day,
      startTime: startTime,
      endTime: endTime,
      location: course.classroom || "미정",
      fromHistory: true
    };

    onAddCourse(adaptedCourse);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>수강 기록 관리</CardTitle>
          <CardDescription>지금까지 수강한 과목을 입력하세요</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={handleNavigateToSchedule}
          >
            <Calendar className="mr-2 h-4 w-4" />
            시간표 생성하기
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                과목 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>과목 추가</SheetTitle>
                <SheetDescription>
                  아래 카테고리에서 과목을 선택하거나 직접 입력하세요.
                </SheetDescription>
              </SheetHeader>
              
              {departmentError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{departmentError}</AlertDescription>
                </Alert>
              )}
              
              <div className="py-4">
                <Tabs defaultValue="major-required" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="major-required" onClick={() => fetchCourses("major-required")}>전공필수</TabsTrigger>
                    <TabsTrigger value="major-elective" onClick={() => fetchCourses("major-elective")}>전공선택</TabsTrigger>
                    <TabsTrigger value="general-required" onClick={() => fetchCourses("general-required")}>교양필수</TabsTrigger>
                    <TabsTrigger value="general-elective" onClick={() => fetchCourses("general-elective")}>교양선택</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="major-required" className="mt-0">
                    {isLoadingCourses ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.course_id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.course_name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.course_code}</span>
                              <span>{course.credit}학점</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userDepartmentId ? (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 전공필수 과목이 없습니다.
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        학과 정보가 필요합니다. 프로필 설정을 완료해주세요.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="major-elective" className="mt-0">
                    {isLoadingCourses ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.course_id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.course_name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.course_code}</span>
                              <span>{course.credit}학점</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userDepartmentId ? (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 전공선택 과목이 없습니다.
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        학과 정보가 필요합니다. 프로필 설정을 완료해주세요.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="general-required" className="mt-0">
                    {isLoadingCourses ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.course_id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.course_name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.course_code}</span>
                              <span>{course.credit}학점</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 교양필수 과목이 없습니다.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="general-elective" className="mt-0">
                    {isLoadingCourses ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.course_id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.course_name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.course_code}</span>
                              <span>{course.credit}학점</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 교양선택 과목이 없습니다.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 border-t pt-4">
                  <Button 
                    onClick={() => setIsAdding(true)} 
                    variant="outline" 
                    className="w-full"
                  >
                    직접 과목 추가하기
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 rounded-lg border bg-secondary/30 animate-scale-in">
            <h4 className="font-medium mb-3">새 과목 추가</h4>
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
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  name="category"
                  value={newCourse.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="majorRequired">전공필수</option>
                  <option value="majorElective">전공선택</option>
                  <option value="generalRequired">교양필수</option>
                  <option value="generalElective">교양선택</option>
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
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                취소
              </Button>
              <Button onClick={handleAddCourse}>
                추가
              </Button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">수강 기록을 불러오는 중...</span>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>과목 코드</TableHead>
                  <TableHead>과목명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>학점</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card">
                {courses.map((course) => (
                  <TableRow key={course.id} className="bg-card hover:bg-secondary/30 transition-colors">
                    <TableCell>{course.code}</TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>
                      {course.category === "majorRequired" && "전공필수"}
                      {course.category === "majorElective" && "전공선택"}
                      {course.category === "generalRequired" && "교양필수"}
                      {course.category === "generalElective" && "교양선택"}
                    </TableCell>
                    <TableCell>{course.credit}학점</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>과목 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{course.name}" 과목을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteCourse(course.id)} className="bg-red-600 hover:bg-red-700">
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      아직 등록된 과목이 없습니다. 과목을 추가해주세요.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseHistoryInput;
