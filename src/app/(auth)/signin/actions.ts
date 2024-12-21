"use server";

import prisma from "@/lib/prisma";
import { signInSchema, SignInValue } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
// import { verify } from "@node-rs/argon2";
import argon2 from "argon2";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(
  credentials: SignInValue,
): Promise<{ error: string }> {
  try {
    const { username, password } = signInSchema.parse(credentials);
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!existingUsername || !existingUsername.passwordHash) {
      return {
        error: "Invalid username or password",
      };
    }
    // const validationPassword = await verify(
    //   existingUsername.passwordHash,
    //   password,
    //   {
    //     memoryCost: 19456,
    //     timeCost: 2,
    //     outputLen: 32,
    //     parallelism: 1,
    //   },
    // );
    const validationPassword = await argon2.verify(
      existingUsername.passwordHash,
      password,
    );
    if (!validationPassword) return { error: "Invalid username or password" };

    const session = await lucia.createSession(existingUsername.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: "Something went wrong. Please try again." };
  }
}
