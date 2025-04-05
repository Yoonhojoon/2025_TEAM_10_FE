
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Course } from "@/components/courses/types";

interface AddCourseFormProps {
  onClose: () => void;
  onAddCourse: (course: Omit<Course, "id">) => void;
}

const AddCourseForm = ({ onClose, onAddCourse }: AddCourseFormProps) => {
  const [newCourse, setNewCourse] = useState<Omit<Course, "id">>({
    code: "",
    name: "",
    category: "majorRequired",
    credit: 3
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: name === "credit" ? parseInt(value) : value
    }));
  };

  const handleSubmit = () => {
    onAddCourse(newCourse);
    setNewCourse({
      code: "",
      name: "",
      category: "majorRequired",
      credit: 3
    });
  };

  const categoryOptions = [
    { value: "majorRequired", label: "전공필수" },
    { value: "majorElective", label: "전공선택" },
    { value: "generalRequired", label: "배분이수" },
    { value: "generalElective", label: "자유이수" },
    { value: "industryRequired", label: "산학필수" },
    { value: "basicGeneral", label: "기초교과" }
  ];

  return (
    <div className="animate-scale-in">
      <h4 className="font-medium mb-3">새 과목 추가</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">과목 코드</label>
          <input
            type="text"
            name="code"
            value={newCourse.code}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="CS101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">과목명</label>
          <input
            type="text"
            name="name"
            value={newCourse.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="프로그래밍 기초"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <select
            name="category"
            value={newCourse.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">학점</label>
          <select
            name="credit"
            value={newCourse.credit}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="1">1학점</option>
            <option value="2">2학점</option>
            <option value="3">3학점</option>
            <option value="4">4학점</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSubmit}>
          추가
        </Button>
      </div>
    </div>
  );
};

export default AddCourseForm;
