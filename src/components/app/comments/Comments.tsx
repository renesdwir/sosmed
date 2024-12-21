import { CommentsPage, postData } from "@/lib/types";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import Comment from "./Comment";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CommentsProps {
  post: postData;
}

export default function Comments({ post }: CommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),

      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => {
        return {
          pages: [...data.pages].reverse(),
          pageParams: [...data.pageParams].reverse(),
        };
      },
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];
  return (
    <div className="space-y-3">
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load more comments
        </Button>
      )}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">No Comments yet </p>
      )}
      {status === "error" && (
        <p className="text-center text-destructive">
          An error occured while loading comments.
        </p>
      )}
      <CommentInput post={post} />
      <div className="divide-y">
        {comments.map((comment) => (
          <div key={comment.id} className="py-2">
            <Comment comment={comment} />
          </div>
        ))}
      </div>
    </div>
  );
}
