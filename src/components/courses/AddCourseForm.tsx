
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "./types";
import { XCircle } from "lucide-react";

interface AddCourseFormProps {
  onClose: () => void;
  onAddCourse: (course: Omit<Course, "id">) => void;
}

const AddCourseForm = ({ onClose, onAddCourse }: AddCourseFormProps) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [credit, setCredit] = useState(3);
  const [category, setCategory] = useState<Course["category"]>("majorRequired");
  const [grade, setGrade] = useState<number | undefined>(undefined);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !code) {
      return;
    }
    
    onAddCourse({
      name,
      code,
      credit,
      category,
      grade
    });
    
    // Reset form
    setName("");
    setCode("");
    setCredit(3);
    setCategory("majorRequired");
    setGrade(undefined);
    
    onClose();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">과목 직접 추가</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">과목명</Label>
        <Input
          id="name"
          placeholder="예: 객체지향프로그래밍"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="code">과목 코드</Label>
        <Input
          id="code"
          placeholder="예: COSE101"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="credit">학점</Label>
          <Select
            value={credit.toString()}
            onValueChange={(value) => setCredit(parseInt(value))}
          >
            <SelectTrigger id="credit">
              <SelectValue placeholder="학점" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1학점</SelectItem>
              <SelectItem value="2">2학점</SelectItem>
              <SelectItem value="3">3학점</SelectItem>
              <SelectItem value="4">4학점</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="grade">학년</Label>
          <Select
            value={grade?.toString() || ""}
            onValueChange={(value) => setGrade(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger id="grade">
              <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">미지정</SelectItem>
              <SelectItem value="1">1학년</SelectItem>
              <SelectItem value="2">2학년</SelectItem>
              <SelectItem value="3">3학년</SelectItem>
              <SelectItem value="4">4학년</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as Course["category"])}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="majorRequired">전공필수</SelectItem>
            <SelectItem value="majorElective">전공선택</SelectItem>
            <SelectItem value="majorBasic">전공기초</SelectItem>
            <SelectItem value="generalRequired">교양필수</SelectItem>
            <SelectItem value="generalElective">교양선택</SelectItem>
            <SelectItem value="industryRequired">산학필수</SelectItem>
            <SelectItem value="basicGeneral">기초교양</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">추가하기</Button>
      </div>
    </form>
  );
};

export default AddCourseForm;
