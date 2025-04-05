
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { CourseCategory } from "@/types/schedule";

interface CategorySelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategories: (categories: CourseCategory[]) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isOpen,
  onOpenChange,
  onSelectCategories,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>([
    "전공필수", "전공선택", "전공기초"
  ]);
  
  const [showWarning, setShowWarning] = useState(false);

  // 경고 메시지 표시 여부를 결정하는 useEffect
  useEffect(() => {
    const hasGeneralCourses = selectedCategories.some(
      category => category === "배분이수교과" || category === "자유이수교과"
    );
    setShowWarning(hasGeneralCourses);
  }, [selectedCategories]);

  const categoryOptions: {value: CourseCategory; label: string}[] = [
    { value: "전공필수", label: "전공필수" },
    { value: "전공선택", label: "전공선택" },
    { value: "전공기초", label: "전공기초" },
    { value: "배분이수교과", label: "배분이수교과" },
    { value: "자유이수교과", label: "자유이수교과" },
    { value: "산학필수", label: "산학필수" },
    { value: "기초교과", label: "기초교과" }
  ];

  const handleToggleCategory = (category: CourseCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = () => {
    onSelectCategories(selectedCategories.length > 0 ? selectedCategories : ["전공필수", "전공선택", "전공기초"]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>추가로 시간표에 구성할 카테고리를 골라주세요</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          {categoryOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${option.value}`} 
                checked={selectedCategories.includes(option.value)}
                onCheckedChange={() => handleToggleCategory(option.value)}
              />
              <Label htmlFor={`category-${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        {showWarning && (
          <div className="flex items-start space-x-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 mb-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
            <p className="text-sm">배분 이수 및 자유 이수를 포함할 경우, 과목 간 밸런스가 무너진 시간표가 나올 수 있습니다.</p>
          </div>
        )}
        
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelectionModal;
