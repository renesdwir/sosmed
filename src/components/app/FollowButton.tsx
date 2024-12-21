"use client";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import kyInstance from "@/lib/ky";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["follower-info", userId];

  const { data, isLoading } = useFollowerInfo(userId, initialState);

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`).json()
        : kyInstance.post(`/api/users/${userId}/followers`).json(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, {
        followers:
          (previousData?.followers || 0) +
          (previousData?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousData?.isFollowedByUser,
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      console.log(error),
        toast({
          variant: "destructive",
          description: "Something went wrong. Please try again later.",
        });
    },
  });

  return (
    <Button
      onClick={() => mutate()}
      variant={data?.isFollowedByUser ? "secondary" : "default"}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
