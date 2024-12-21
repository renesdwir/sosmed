import { z } from "zod";

// const requiredString = z.string().trim().min(1, "Required");

const requiredString = (name: string) => {
  return z.string().trim().min(1, `${name} is required !`);
};

export const signUpSchema = z.object({
  email: requiredString("email").email("invalid email address"),
  username: requiredString("username").regex(
    /^[a-zA-Z0-9_]+$/,
    "only letters, numbers, and - allowed",
  ),
  password: requiredString("password").min(8, "Must be at least 8 characters"),
});

export type SignUpValue = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  username: requiredString("username"),
  password: requiredString("password"),
});

export type SignInValue = z.infer<typeof signInSchema>;

export const createPostSchema = z.object({
  content: requiredString("content"),
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 medias"),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString("display name"),
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  content: requiredString("content"),
});
