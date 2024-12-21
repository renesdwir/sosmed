import { validateRequest } from "@/auth";
import { errorHandlerApi } from "@/lib/errorHandlerAPI";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json(...errorHandlerApi(401));
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followerId: loggedInUser.id },
          select: { followerId: true },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });
    if (!user) return Response.json(...errorHandlerApi(404, "User"));
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: user.followers.length > 0,
    };
    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json(...errorHandlerApi(500));
  }
}

export async function POST(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json(...errorHandlerApi(401));

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);
    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json(...errorHandlerApi(500));
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return Response.json(...errorHandlerApi(401));

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);
    return new Response();
  } catch (error) {
    console.log(error);
    return Response.json(...errorHandlerApi(500));
  }
}
