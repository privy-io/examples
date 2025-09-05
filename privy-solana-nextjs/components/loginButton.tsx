"use client";

import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: (user) => {
      if (user.user) {
        router.replace("/dashboard");
      }
    },
  });

  return (
    <button
      onClick={login}
      className="rounded-full border border-solid border-transparent transition-colors cursor-pointer flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
      type="button"
    >
      Log in
    </button>
  );
}
