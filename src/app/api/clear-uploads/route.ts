import { errorHandlerApi } from "@/lib/errorHandlerAPI";
import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(...errorHandlerApi(401));
    }

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? { createdAt: { lte: new Date(Date.now() - 1000 * 60 * 60 * 24) } }
          : {}),
      },
      select: { id: true, url: true },
    });

    new UTApi().deleteFiles(unusedMedia.map((m) => m.url.split(`/f/`)[1]));

    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json(...errorHandlerApi(500));
  }
}
