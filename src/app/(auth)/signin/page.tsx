import { Metadata } from "next";
import Link from "next/link";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <div className="w-96 rounded-lg border p-8 shadow-lg">
        <h1 className="text-center text-xl font-bold">Sign In</h1>
        <SignInForm />
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline hover:text-blue-600">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
