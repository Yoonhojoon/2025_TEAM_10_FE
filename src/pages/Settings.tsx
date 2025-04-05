import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface Department {
  department_id: string;
  department_name: string;
}

const Settings = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Load user's current settings
    if (user.user_metadata) {
      if (user.user_metadata.department_id) {
        setSelectedDepartment(user.user_metadata.department_id);
      }
      if (user.user_metadata.grade) {
        setSelectedGrade(user.user_metadata.grade.toString());
      }
    }
    
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .not('department_name', 'eq', '전체');
          
        if (error) throw error;
        
        setDepartments(data || []);
        
        // If user has no department set, use the first one
        if (!selectedDepartment && data && data.length > 0) {
          setSelectedDepartment(data[0].department_id);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "부서 정보 불러오기 실패",
          description: "부서 정보를 불러오는데 문제가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDepartments();
  }, [user, navigate, selectedDepartment, toast]);
  
  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Find department name from ID
      const department = departments.find(d => d.department_id === selectedDepartment);
      
      if (!department) {
        throw new Error("선택한 학과를 찾을 수 없습니다.");
      }
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          department: department.department_name,
          department_id: selectedDepartment,
          grade: parseInt(selectedGrade),
        }
      });
      
      if (error) throw error;
      
      // Update the users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .upsert({
          user_id: user.id,
          department_id: selectedDepartment,
          grade: parseInt(selectedGrade)
        });
      
      if (userUpdateError) throw userUpdateError;
      
      // Refresh user after update
      await refreshUser();
      
      toast({
        title: "설정 저장 완료",
        description: "사용자 설정이 성공적으로 저장되었습니다.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "설정 저장 실패",
        description: error.message || "설정을 저장하는데 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">설정</h1>
              <p className="text-muted-foreground">
                사용자 프로필 및 애플리케이션 설정을 관리합니다.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="mr-2 h-5 w-5" />
                    학적 정보
                  </CardTitle>
                  <CardDescription>학과 및 학년 정보를 업데이트합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="department">학과</Label>
                    <Select
                      disabled={isLoading}
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="학과를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grade">학년</Label>
                    <Select
                      value={selectedGrade}
                      onValueChange={setSelectedGrade}
                    >
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="학년을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1학년</SelectItem>
                        <SelectItem value="2">2학년</SelectItem>
                        <SelectItem value="3">3학년</SelectItem>
                        <SelectItem value="4">4학년</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    onClick={handleSaveSettings} 
                    loading={isSaving}
                    size="lg"
                    icon={<Save size={18} />}
                  >
                    저장하기
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>사용자 정보</CardTitle>
                  <CardDescription>현재 설정된 사용자 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">이메일</h3>
                      <p>{user?.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">학과</h3>
                      <p>{user?.user_metadata?.department || "설정되지 않음"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">학년</h3>
                      <p>{user?.user_metadata?.grade ? `${user.user_metadata.grade}학년` : "설정되지 않음"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
