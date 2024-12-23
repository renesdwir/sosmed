import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: BookmarkButtonProps) {
  const { toast } = useToast();

  const queryKey: QueryKey = ["bookmark-info", postId];

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey,
    queryFn: async () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      try {
        data.isBookmarkedByUser
          ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
          : kyInstance.post(`/api/posts/${postId}/bookmark`);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`,
      });
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));
      return { previousState };
    },
    onError: (error, variables, context) => {
      console.log(error);
      queryClient.setQueryData<BookmarkInfo>(queryKey, context?.previousState);
      toast({
        description: "Something went wrong, Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
