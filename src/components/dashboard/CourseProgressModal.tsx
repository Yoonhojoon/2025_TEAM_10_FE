
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { DbCourse } from "@/components/courses/types";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CourseProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string; // This is the English category from ProgressDashboard
  categoryKorean: string; // This is already the Korean category
}

const CourseProgressModal = ({ isOpen, onClose, category, categoryKorean }: CourseProgressModalProps) => {
  const [completedCourses, setCompletedCourses] = useState<DbCourse[]>([]);
  const [remainingCourses, setRemainingCourses] = useState<DbCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const userGrade = user?.user_metadata?.grade ? parseInt(user.user_metadata.grade) : 4;

  useEffect(() => {
    if (!isOpen || !user) return;
    
    const fetchCourses = async () => {
      setIsLoading(true);
      
      try {
        // 1. 사용자가 수강한 과목 목록 가져오기
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            course_id,
            courses(*)
          `)
          .eq('user_id', user.id);
        
        if (enrollmentError) throw enrollmentError;
        
        // 2. 사용자 학과 정보 가져오기
        const departmentName = user.user_metadata?.department;
        if (!departmentName) throw new Error("Department information not found");
        
        const { data: departmentData, error: departmentError } = await supabase
          .from('departments')
          .select('department_id')
          .eq('department_name', departmentName)
          .single();
        
        if (departmentError) throw departmentError;
        
        // 3. 학과의 모든 과목 불러오기 (해당 카테고리의)
        // Make sure categoryKorean is a valid category in the database
        const { data: allCourses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('department_id', departmentData.department_id)
          .eq('category', categoryKorean as DbCourse['category']);
          
        if (coursesError) throw coursesError;
        
        // 4. 이미 들은 과목과 아직 듣지 않은 과목으로 분류
        const completedCourseIds = enrollments
          .filter(e => e.courses?.category === categoryKorean)
          .map(e => e.course_id);
        
        // Get completed courses and sort by grade
        const completed = allCourses
          .filter(course => completedCourseIds.includes(course.course_id))
          .sort((a, b) => {
            // Handle null grades (place them at the end)
            if (a.grade === null) return 1;
            if (b.grade === null) return -1;
            // Sort by grade ascending
            return (a.grade || 0) - (b.grade || 0);
          });
        
        // Get remaining courses and sort by grade
        const remaining = allCourses
          .filter(course => !completedCourseIds.includes(course.course_id))
          .sort((a, b) => {
            // Handle null grades (place them at the end)
            if (a.grade === null) return 1;
            if (b.grade === null) return -1;
            // Sort by grade ascending
            return (a.grade || 0) - (b.grade || 0);
          });
        
        setCompletedCourses(completed);
        setRemainingCourses(remaining);
      } catch (error) {
        console.error("Error fetching course progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [isOpen, user, categoryKorean]);

  // Filter courses based on search query
  const filteredCompletedCourses = completedCourses.filter(course => 
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRemainingCourses = remainingCourses.filter(course => 
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{categoryKorean} 과목 진행 상황</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <Input
            placeholder="과목 이름 또는 코드로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">데이터 로딩 중...</p>
          </div>
        ) : (
          <Tabs defaultValue="completed" className="w-full mt-4">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="completed">이수 완료 ({filteredCompletedCourses.length})</TabsTrigger>
              <TabsTrigger value="remaining">미이수 ({filteredRemainingCourses.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="completed">
              <CourseTable 
                courses={filteredCompletedCourses} 
                isEmpty={filteredCompletedCourses.length === 0} 
                type="completed" 
                userGrade={userGrade}
              />
            </TabsContent>
            
            <TabsContent value="remaining">
              <CourseTable 
                courses={filteredRemainingCourses} 
                isEmpty={filteredRemainingCourses.length === 0} 
                type="remaining" 
                userGrade={userGrade}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface CourseTableProps {
  courses: DbCourse[];
  isEmpty: boolean;
  type: 'completed' | 'remaining';
  userGrade: number;
}

const CourseTable = ({ courses, isEmpty, type, userGrade }: CourseTableProps) => {
  if (isEmpty) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {type === 'completed' ? '이수한 과목이 없습니다.' : '남은 과목이 없습니다.'}
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>과목 코드</TableHead>
            <TableHead>과목명</TableHead>
            <TableHead>학년</TableHead>
            <TableHead className="text-right">학점</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow 
              key={course.course_id}
              className={course.grade && userGrade > course.grade ? "text-red-600 font-medium" : ""}
            >
              <TableCell className="font-medium">{course.course_code}</TableCell>
              <TableCell>{course.course_name}</TableCell>
              <TableCell>{course.grade || "-"}</TableCell>
              <TableCell className="text-right">{course.credit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseProgressModal;
