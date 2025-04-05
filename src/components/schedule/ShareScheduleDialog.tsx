
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share } from "lucide-react";
import { ScheduleCourse } from "@/types/schedule";
import { createShareableLink } from "@/utils/shareScheduleUtils";
import { useToast } from "@/hooks/use-toast";

interface ShareScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courses: ScheduleCourse[];
}

const ShareScheduleDialog: React.FC<ShareScheduleDialogProps> = ({
  isOpen,
  onOpenChange,
  courses,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  React.useEffect(() => {
    if (isOpen && courses.length > 0) {
      try {
        const url = createShareableLink(courses);
        setShareUrl(url);
      } catch (error) {
        console.error('Error creating share URL:', error);
        toast({
          title: "공유 링크 생성 실패",
          description: "시간표 공유 링크를 생성하는데 실패했습니다.",
          variant: "destructive",
        });
      }
    } else {
      setCopied(false);
    }
  }, [isOpen, courses, toast]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "클립보드에 복사됨",
        description: "공유 링크가 클립보드에 복사되었습니다.",
      });
      
      // Reset copied status after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드에 복사하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // Generate QR code URL using simple API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">시간표 공유</DialogTitle>
          <DialogDescription>
            아래 링크를 공유하여 현재 시간표를 다른 사람들과 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Input 
              value={shareUrl} 
              readOnly
              className="flex-1"
              onFocus={(e) => e.target.select()}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopyToClipboard}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          {shareUrl && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">스캔하여 공유</p>
              <div className="bg-white p-2 rounded-lg">
                <img 
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="rounded"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              variant="default"
              onClick={handleCopyToClipboard}
              className="gap-2"
            >
              <Share className="h-4 w-4" /> 링크 복사
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareScheduleDialog;
