import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <div className="w-96 rounded-lg border p-8 shadow-lg">
        <h1 className="text-center text-xl font-bold">Sign Up</h1>
        <SignUpForm />
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="underline hover:text-blue-600">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
