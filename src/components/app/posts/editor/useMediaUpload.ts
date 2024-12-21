import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachment, setAttachment] = useState<Attachment[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("attachments", {
    onBeforeUploadBegin(files) {
      const renamedFile = files.map((file) => {
        const extention = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extention}`,
          { type: file.type },
        );
      });

      setAttachment((prev) => [
        ...prev,
        ...renamedFile.map((file) => ({ file, isUploading: true })),
      ]);

      return renamedFile;
    },
    onUploadProgress(progress) {
      setUploadProgress(progress);
    },
    onClientUploadComplete(result) {
      setAttachment((prev) =>
        prev.map((attachment) => {
          const uploadResult = result.find(
            (res) => res.name === attachment.file.name,
          );
          if (!uploadResult) return attachment;
          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );
    },
    onUploadError(error) {
      setAttachment((prev) => prev.filter((a) => !a.isUploading));
      toast({
        variant: "destructive",
        description: error.message,
      });
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Upload already in progress",
      });
      return;
    }

    if (attachment.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload 5 attachments per post",
      });
      return;
    }

    startUpload(files);
  }

  function handleRemoveAttachment(fileName: string) {
    setAttachment((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function reset() {
    setAttachment([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachment,
    isUploading,
    uploadProgress,
    removeAttachment: handleRemoveAttachment,
    reset,
  };
}
