import { validateRequest } from "@/auth";
import { errorHandlerApi } from "@/lib/errorHandlerAPI";
import prisma from "@/lib/prisma";

export async function PATCH() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json(...errorHandlerApi(401));
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json(...errorHandlerApi(500));
  }
}
