import { validateRequest } from "@/auth";
import { errorHandlerApi } from "@/lib/errorHandlerAPI";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { username } }: { params: { username: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) return Response.json(...errorHandlerApi(401));

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.id),
    });
    if (!user) return Response.json(...errorHandlerApi(404));

    return Response.json(user);
  } catch (error) {
    console.log(error);
    return Response.json(...errorHandlerApi(500));
  }
}
