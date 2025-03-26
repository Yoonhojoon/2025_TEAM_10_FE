
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface GraduationRequirement {
  category: string;
  requirements: string[];
  totalCredits?: number;
}

const khuCSRequirements: GraduationRequirement[] = [
  {
    category: "총 이수학점",
    requirements: ["최소 130학점 이상 이수"],
    totalCredits: 130
  },
  {
    category: "전공 이수학점",
    requirements: [
      "단일전공자는 전공 관련 과목 87학점 이상 이수해야 함 (전공기초 15학점 + 전공필수 45학점 + 산학필수 12학점 + 전공선택 15학점)",
      "복수전공자는 컴퓨터공학 전공 54학점 이상(전공기초 12 + 전공필수 27 + 전공선택 15) 이수"
    ],
    totalCredits: 87
  },
  {
    category: "교양 이수학점",
    requirements: [
      "후마니타스 교양교육과정을 충족해야 하며, 최소 29학점 이상 이수 (필수교양 17학점 + 배분이수 9학점 이상 + 자유이수 3학점 이상)"
    ],
    totalCredits: 29
  },
  {
    category: "졸업논문",
    requirements: [
      "필수 - 졸업논문은 캡스톤프로젝트 과목 이수로 대체된다. 컴퓨터공학과의 경우 '캡스톤프로젝트' 교과목을 수강 및 완료하면 졸업논문 합격으로 인정 (단, 졸업논문(컴퓨터공학) 과목을 별도로 수강 신청해야 함)"
    ]
  },
  {
    category: "졸업시험",
    requirements: [
      "없음 - 별도의 졸업 종합시험은 시행되지 않음 (캡스톤프로젝트 통과 이수로 졸업 요건을 충족)"
    ]
  },
  {
    category: "인증제 (토익 또는 기타 영어)",
    requirements: [
      "과거 졸업능력인증제(영어영어 성적 등 으로 제한)가 운영되었으나 2024학년도부터 폐지됨",
      "이전에는 TOEIC 등 공인영어 성적 제출 또는 대체 영어 승촉으로 대체 가능 (예: TOEIC 700점 이상 등)",
      "현재는 전공과목 영어강의 3과목 이상 이수(필수영어 1과목 이상)가 사실상의 영어 요건으로 남아 있음"
    ]
  },
  {
    category: "기타 요건",
    requirements: [
      "캡스톤디자인 등 산업연계 교과목 이수 필수 (현장 실습필수 12학점에 포함)",
      "또한 SW교육 이수 요건으로 2018학번 이후 모든 학생은 SW 기초교양/관련 교과목 6학점 이상 이수해야 함",
      "봉사활동(사회봉사 교과목 등)은 별도의 졸업 요건은 아님 (학생 선택에 따라 이수 가능)"
    ]
  }
];

const GraduationRequirements = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>경희대학교 컴퓨터공학과 졸업 요건</CardTitle>
        <CardDescription>2024년 기준 졸업 요건 안내</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>안내사항</AlertTitle>
          <AlertDescription>
            아래 내용은 경희대학교 컴퓨터공학과 학과 시행세칙(2024년 기준), 후마니타스 칼리지 교양과정 안내 등을 참고하여 작성되었습니다.
            정확한 정보는 학과 사무실이나 공식 홈페이지를 통해 확인하시기 바랍니다.
          </AlertDescription>
        </Alert>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/5">
                  항목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  졸업 요건
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {khuCSRequirements.map((item, index) => (
                <tr key={index} className="bg-card hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium">
                    {item.category}
                    {item.totalCredits && (
                      <div className="text-xs text-muted-foreground mt-1">
                        총 {item.totalCredits}학점
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <ul className="list-disc pl-5 space-y-2">
                      {item.requirements.map((req, reqIndex) => (
                        <li key={reqIndex}>{req}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraduationRequirements;
