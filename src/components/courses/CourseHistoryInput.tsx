
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, PlusCircle, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  code: string;
  name: string;
  category: "majorRequired" | "majorElective" | "generalRequired" | "generalElective";
  credit: number;
  semester: string;
  grade: string;
}

interface CourseHistoryInputProps {
  courses: Course[];
  onAddCourse: (course: Omit<Course, "id">) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateCourse: (id: string, course: Partial<Course>) => void;
}

interface DbCourse {
  id: string;
  code: string;
  name: string;
  requirement_type: string;
  credit: number;
  department: string;
}

const CourseHistoryInput = ({ 
  courses,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourse
}: CourseHistoryInputProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState<Omit<Course, "id">>({
    code: "",
    name: "",
    category: "majorRequired",
    credit: 3,
    semester: "",
    grade: "A+"
  });
  const [dbCourses, setDbCourses] = useState<DbCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
      code: "",
      name: "",
      category: "majorRequired",
      credit: 3,
      semester: "",
      grade: "A+"
    });
    setIsAdding(false);
  };
  
  const handleStartEdit = (course: Course) => {
    setEditingId(course.id);
    setNewCourse({
      code: course.code,
      name: course.name,
      category: course.category,
      credit: course.credit,
      semester: course.semester,
      grade: course.grade
    });
  };
  
  const handleUpdateCourse = () => {
    if (editingId) {
      onUpdateCourse(editingId, newCourse);
      setEditingId(null);
      setNewCourse({
        code: "",
        name: "",
        category: "majorRequired",
        credit: 3,
        semester: "",
        grade: "A+"
      });
    }
  };

  const handleNavigateToSchedule = () => {
    navigate('/schedule');
    toast({
      title: "시간표 생성",
      description: "시간표 생성 페이지로 이동했습니다.",
      duration: 3000,
    });
  };

  const fetchCourses = async (department: string, requirementType: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('department', department)
        .eq('requirement_type', requirementType);
      
      if (error) {
        throw error;
      }
      
      setDbCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "오류 발생",
        description: "과목 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectCourseFromDb = (course: DbCourse) => {
    const mappedCategory = (): "majorRequired" | "majorElective" | "generalRequired" | "generalElective" => {
      switch (course.requirement_type) {
        case "major_required": return "majorRequired";
        case "major_elective": return "majorElective";
        case "general_required": return "generalRequired";
        case "general_elective": return "generalElective";
        default: return "generalElective";
      }
    };

    const mappedCourse = {
      code: course.code,
      name: course.name,
      category: mappedCategory(),
      credit: course.credit,
      semester: new Date().getFullYear() + "-" + (new Date().getMonth() < 6 ? "1" : "2"),
      grade: "A+"
    };

    onAddCourse(mappedCourse);
    toast({
      title: "과목 추가",
      description: `${course.name} 과목이 추가되었습니다.`,
    });
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
              
              <div className="py-4">
                <Tabs defaultValue="major-required" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="major-required" onClick={() => fetchCourses("컴퓨터공학과", "major_required")}>전공필수</TabsTrigger>
                    <TabsTrigger value="major-elective" onClick={() => fetchCourses("컴퓨터공학과", "major_elective")}>전공선택</TabsTrigger>
                    <TabsTrigger value="general-required" onClick={() => fetchCourses("공통", "general_required")}>교양필수</TabsTrigger>
                    <TabsTrigger value="general-elective" onClick={() => fetchCourses("공통", "general_elective")}>교양선택</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="major-required" className="mt-0">
                    {isLoading ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.code}</span>
                              <span>{course.credit}학점</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 전공필수 과목이 없습니다.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="major-elective" className="mt-0">
                    {isLoading ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.code}</span>
                              <span>{course.credit}학점</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        등록된 전공선택 과목이 없습니다.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="general-required" className="mt-0">
                    {isLoading ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.code}</span>
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
                    {isLoading ? (
                      <div className="py-8 text-center text-muted-foreground">
                        과목 정보를 불러오는 중...
                      </div>
                    ) : dbCourses.length > 0 ? (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {dbCourses.map(course => (
                          <div 
                            key={course.id} 
                            className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                            onClick={() => selectCourseFromDb(course)}
                          >
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>{course.code}</span>
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
              <div>
                <label className="block text-sm font-medium mb-1">이수 학기</label>
                <input
                  type="text"
                  name="semester"
                  value={newCourse.semester}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="2023-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">성적</label>
                <select
                  name="grade"
                  value={newCourse.grade}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                  <option value="P">P (Pass)</option>
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
        
        {editingId && (
          <div className="mb-6 p-4 rounded-lg border bg-secondary/30 animate-scale-in">
            <h4 className="font-medium mb-3">과목 수정</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">과목 코드</label>
                <input
                  type="text"
                  name="code"
                  value={newCourse.code}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
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
              <div>
                <label className="block text-sm font-medium mb-1">이수 학기</label>
                <input
                  type="text"
                  name="semester"
                  value={newCourse.semester}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">성적</label>
                <select
                  name="grade"
                  value={newCourse.grade}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                  <option value="P">P (Pass)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>
                취소
              </Button>
              <Button onClick={handleUpdateCourse}>
                저장
              </Button>
            </div>
          </div>
        )}
        
        <div className="rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  과목 코드
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  과목명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  학점
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  학기
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  성적
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {courses.map((course) => (
                <tr key={course.id} className="bg-card hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-sm">{course.code}</td>
                  <td className="px-4 py-3 text-sm font-medium">{course.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {course.category === "majorRequired" && "전공필수"}
                    {course.category === "majorElective" && "전공선택"}
                    {course.category === "generalRequired" && "교양필수"}
                    {course.category === "generalElective" && "교양선택"}
                  </td>
                  <td className="px-4 py-3 text-sm">{course.credit}학점</td>
                  <td className="px-4 py-3 text-sm">{course.semester}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${course.grade === 'A+' || course.grade === 'A' || course.grade === 'P' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : course.grade === 'B+' || course.grade === 'B' 
                        ? 'bg-blue-100 text-blue-800'
                        : course.grade === 'C+' || course.grade === 'C'
                        ? 'bg-yellow-100 text-yellow-800'
                        : course.grade === 'D+' || course.grade === 'D'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {course.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>과목 수정</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{course.name}" 과목을 수정하시겠습니까?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStartEdit(course)}>
                            수정
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors ml-2"
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
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    아직 등록된 과목이 없습니다. 과목을 추가해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseHistoryInput;
