
import React, { useState } from "react";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X, Tag } from "lucide-react";

interface SaveScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, tags: string[]) => Promise<void>;
  isSaving: boolean;
}

const SaveScheduleDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  isSaving
}: SaveScheduleDialogProps) => {
  const [scheduleName, setScheduleName] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleSave = async () => {
    if (!scheduleName.trim()) return;
    
    await onSave(scheduleName.trim(), tags);
    setScheduleName("");
    setTags([]);
    onOpenChange(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>시간표 저장</AlertDialogTitle>
          <AlertDialogDescription>
            현재 시간표를 저장하려면 이름을 입력하세요. 선택적으로 태그를 추가할 수 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-name">시간표 이름</Label>
            <Input
              id="schedule-name"
              placeholder="2024-1 시간표"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schedule-tags">태그 (선택 사항)</Label>
            <div className="flex space-x-2">
              <Input
                id="schedule-tags"
                placeholder="태그 입력"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                추가
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t, i) => (
                  <div 
                    key={i} 
                    className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {t}
                    <button 
                      onClick={() => handleRemoveTag(t)}
                      className="ml-1 text-primary hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">취소</Button>
          </AlertDialogCancel>
          <Button onClick={handleSave} disabled={!scheduleName.trim() || isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveScheduleDialog;
