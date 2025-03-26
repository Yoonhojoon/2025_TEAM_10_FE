
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/Card";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Step {
  title: string;
  subtitle: string;
}

interface ProfileData {
  name: string;
  studentId: string;
  department: string;
  admissionYear: string;
  email: string;
}

const steps: Step[] = [
  {
    title: "기본 정보",
    subtitle: "이름과 학번을 입력해주세요",
  },
  {
    title: "학과 정보",
    subtitle: "소속 학과와 입학 연도를 입력해주세요",
  },
  {
    title: "계정 정보",
    subtitle: "이메일을 입력해주세요",
  },
];

const ProfileForm = ({ onComplete }: { onComplete: (data: ProfileData) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    studentId: "",
    department: "",
    admissionYear: "",
    email: "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(profileData);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const isButtonDisabled = () => {
    if (currentStep === 0) {
      return !profileData.name || !profileData.studentId;
    } else if (currentStep === 1) {
      return !profileData.department || !profileData.admissionYear;
    } else {
      return !profileData.email;
    }
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentStep
                    ? "bg-primary/20 text-primary border border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? <CheckCircle size={18} /> : index + 1}
              </div>
              <span className="mt-2 text-xs hidden md:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <CardTitle>{steps[currentStep].title}</CardTitle>
        <CardDescription>{steps[currentStep].subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium"
                >
                  학번
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={profileData.studentId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="20XX12345"
                />
              </div>
            </>
          )}
          
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium"
                >
                  소속 학과
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="컴퓨터공학과"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="admissionYear"
                  className="block text-sm font-medium"
                >
                  입학 연도
                </label>
                <input
                  type="text"
                  id="admissionYear"
                  name="admissionYear"
                  value={profileData.admissionYear}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="20XX"
                />
              </div>
            </>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="example@email.com"
              />
            </div>
          )}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
            >
              이전
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={isButtonDisabled()}
              icon={currentStep === steps.length - 1 ? undefined : <ChevronRight size={16} />}
              iconPosition="right"
            >
              {currentStep === steps.length - 1 ? "완료" : "다음"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
