"use server";
import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValue } from "@/lib/validation";
// import { hash } from "@node-rs/argon2";
// import argon2 from "argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function signUp(payload: SignUpValue): Promise<{ error: string }> {
  try {
    const { email, password, username } = signUpSchema.parse(payload);

    // const passwordHash = await hash(password, {
    //   // https://lucia-auth.com/tutorials/username-and-password/nextjs-app#:~:text=%7D%3B%0A%09%7D%0A%0A%09const-,passwordHash,-%3D%20await%20hash
    //   memoryCost: 19456,
    //   timeCost: 2,
    //   outputLen: 32,
    //   parallelism: 1,
    // });

    // const passwordHash = await argon2.hash(password, {
    //   type: argon2.argon2id, // Gunakan Argon2id untuk keamanan optimal
    //   memoryCost: 19456, // Sesuai konfigurasi sebelumnya
    //   timeCost: 2, // Iterasi
    //   parallelism: 1, // Paralelisme
    //   hashLength: 32, // Panjang output hash
    // });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateIdFromEntropySize(10);

    // checking username
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    // checking email
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          username,
          displayName: username,
          passwordHash,
        },
      });

      await streamServerClient.upsertUser({
        id: userId,
        name: username,
        username,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    return redirect("/");
  } catch (error) {
    console.log(error);
    if (isRedirectError(error)) throw error;
    return {
      error: "Something went wrong. Please try again",
    };
  }
}

// 1:32
