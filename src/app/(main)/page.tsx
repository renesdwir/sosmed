import PostEditor from "@/components/app/posts/editor/PostEditor";
import Post from "@/components/app/posts/Post";
import TrendsSidebar from "@/components/app/TrendsSidebar";
import prisma from "@/lib/prisma";
import ForYourFeed from "./ForYourFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="for-your-page">
          <TabsList>
            <TabsTrigger value="for-your-page">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-your-page">
            <ForYourFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
