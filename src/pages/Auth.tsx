
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// 학과 목록
const departments = [
  "컴퓨터공학과",
  "전자공학과",
  "기계공학과",
  "산업경영공학과",
  "화학공학과",
  "재료공학과",
  "생명공학과",
  "건축공학과",
  "토목공학과",
  "경영학과",
  "경제학과",
  "국어국문학과",
  "영어영문학과",
  "사학과",
  "철학과",
  "법학과",
  "정치외교학과",
  "행정학과",
  "미디어학과",
  "심리학과",
  "사회학과",
];

// 입학년도 목록 생성 (현재 연도 기준으로 10년 전까지)
const getEntryYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 10; i++) {
    years.push(currentYear - i);
  }
  return years;
};

const entryYears = getEntryYears();

// 학번 자동 생성 (학과 + 입학년도 + 숫자)
const generateStudentId = (department: string, entryYear: number) => {
  const deptCode = departments.indexOf(department) + 1;
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${entryYear.toString().slice(-2)}${deptCode.toString().padStart(2, '0')}${randomNum}`;
};

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // 로그인 상태
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 회원가입 상태
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [entryYear, setEntryYear] = useState<number>(new Date().getFullYear());
  const [studentId, setStudentId] = useState("");

  // 회원가입 처리
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !name || !department || !entryYear) {
      toast({
        title: "모든 필드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // 학번이 입력되지 않은 경우 자동 생성
    const finalStudentId = studentId || generateStudentId(department, entryYear);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name,
            department,
            student_id: finalStudentId,
            entry_year: entryYear,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "회원가입 성공!",
        description: "로그인하여 서비스를 이용해보세요.",
      });

      setActiveTab("login");
      setLoginEmail(signupEmail);
      setLoginPassword(signupPassword);
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "이메일과 비밀번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "로그인 성공!",
        description: "환영합니다.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 학과와 입학년도가 선택될 때 학번 자동 생성
  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    if (value && entryYear) {
      setStudentId(generateStudentId(value, entryYear));
    }
  };

  const handleEntryYearChange = (value: string) => {
    const year = parseInt(value);
    setEntryYear(year);
    if (department && year) {
      setStudentId(generateStudentId(department, year));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {activeTab === "login" ? "로그인" : "회원가입"}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === "login"
              ? "이메일과 비밀번호를 입력하여 로그인하세요"
              : "필요한 정보를 입력하여 계정을 생성하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">비밀번호</Label>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">학과</Label>
                  <Select 
                    value={department} 
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="학과를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryYear">입학년도</Label>
                  <Select 
                    value={entryYear.toString()} 
                    onValueChange={handleEntryYearChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="입학년도를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {entryYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">학번</Label>
                  <Input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="학과와 입학년도 선택 시 자동 생성됩니다"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "회원가입 중..." : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
