
import { Course } from "@/components/courses/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface CourseTableProps {
  courses: Course[];
  onDeleteCourse: (id: string) => void;
  isLoading: boolean;
}

const CourseTable = ({ courses, onDeleteCourse, isLoading }: CourseTableProps) => {
  const { user } = useAuth();
  const userGrade = user?.user_metadata?.grade ? parseInt(user.user_metadata.grade) : 4;

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">수강 기록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead>과목 코드</TableHead>
            <TableHead>과목명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>학점</TableHead>
            <TableHead>학년</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-card">
          {courses.map((course) => (
            <TableRow 
              key={course.id} 
              className={`bg-card hover:bg-secondary/30 transition-colors ${
                course.grade && userGrade > course.grade ? "text-red-600 font-medium" : ""
              }`}
            >
              <TableCell>{course.code}</TableCell>
              <TableCell className="font-medium">{course.name}</TableCell>
              <TableCell>
                {course.category === "majorRequired" && "전공필수"}
                {course.category === "majorElective" && "전공선택"}
                {course.category === "generalRequired" && "교양필수"}
                {course.category === "generalElective" && "교양선택"}
                {course.category === "industryRequired" && "산학필수"}
                {course.category === "majorBasic" && "전공기초"}
                {course.category === "basicGeneral" && "기초교양"}
              </TableCell>
              <TableCell>{course.credit}학점</TableCell>
              <TableCell>{course.grade || "-"}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-red-600 hover:text-red-800 transition-colors">
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
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                아직 등록된 과목이 없습니다. 과목을 추가해주세요.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseTable;
