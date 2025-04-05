
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CategorySelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategories: (categories: string[]) => void;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isOpen,
  onOpenChange,
  onSelectCategories,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전공필수", "전공선택", "전공기초"
  ]);

  const categoryOptions = [
    { value: "전공필수", label: "전공필수" },
    { value: "전공선택", label: "전공선택" },
    { value: "전공기초", label: "전공기초" },
    { value: "배분이수교과", label: "배분이수교과" },
    { value: "자유이수교과", label: "자유이수교과" },
    { value: "산학필수", label: "산학필수" },
    { value: "기초교과", label: "기초교과" }
  ];

  const handleToggleCategory = (category: string) => {
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
