
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface GeneratedSchedule {
  name: string;
  태그?: string[];
  과목들?: {
    course_id: string;
    과목_이름: string;
    학수번호: string;
    학점: number;
    강의_시간: string;
    강의실: string;
  }[];
  courses?: {
    course_id: string;
    course_name: string;
    course_code: string;
    credit: number;
    schedule_time: string;
    classroom: string;
  }[];
  총_학점?: number;
  total_credits?: number;
  설명?: string;
  description?: string;
}

interface GeneratedSchedulesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generatedSchedules: GeneratedSchedule[];
  isGeneratingSchedules: boolean;
  onApplySchedule: (schedule: GeneratedSchedule) => void;
}

const GeneratedSchedulesDialog = ({
  isOpen,
  onOpenChange,
  generatedSchedules,
  isGeneratingSchedules,
  onApplySchedule
}: GeneratedSchedulesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>추천 시간표</DialogTitle>
          <DialogDescription>
            AI가 생성한 추천 시간표입니다. 확인하고 필요한 시간표를 선택하세요.
          </DialogDescription>
        </DialogHeader>
        
        {isGeneratingSchedules ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">시간표 생성 중...</p>
          </div>
        ) : (
          <Tabs defaultValue="option1" className="mt-4">
            <TabsList className="grid grid-cols-3">
              {generatedSchedules.map((schedule, index) => (
                <TabsTrigger key={index} value={`option${index + 1}`}>
                  {schedule.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {generatedSchedules.map((schedule, index) => (
              <TabsContent key={index} value={`option${index + 1}`}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      총 {schedule.총_학점 || schedule.total_credits}학점
                    </h3>
                    {schedule.태그 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {schedule.태그.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-muted-foreground mt-1">
                      {schedule.설명 || schedule.description}
                    </p>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left">과목 코드</th>
                          <th className="px-4 py-2 text-left">과목명</th>
                          <th className="px-4 py-2 text-left">학점</th>
                          <th className="px-4 py-2 text-left">시간</th>
                          <th className="px-4 py-2 text-left">강의실</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(schedule.과목들 || schedule.courses || []).map((course, courseIndex) => {
                          const courseName = "과목_이름" in course ? course.과목_이름 : course.course_name;
                          const courseCode = "학수번호" in course ? course.학수번호 : course.course_code;
                          const credit = "학점" in course ? course.학점 : course.credit;
                          const scheduleTime = "강의_시간" in course ? course.강의_시간 : course.schedule_time;
                          const classroom = "강의실" in course ? course.강의실 : course.classroom;
                          
                          return (
                            <tr key={courseIndex} className="border-t">
                              <td className="px-4 py-2">{courseCode}</td>
                              <td className="px-4 py-2 font-medium">{courseName}</td>
                              <td className="px-4 py-2">{credit}학점</td>
                              <td className="px-4 py-2">{scheduleTime}</td>
                              <td className="px-4 py-2">{classroom || "미정"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => onApplySchedule(schedule)}>
                      이 시간표 보기
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GeneratedSchedulesDialog;
