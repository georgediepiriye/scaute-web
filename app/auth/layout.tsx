"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Start by assuming we are waiting for the client environment to settle
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("skaute_token");
    const localUser = localStorage.getItem("user");

    if (token) {
      // Check if the already logged-in user is an admin
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser?.role === "admin") {
            router.replace("/admin/dashboard");
            return;
          }
        } catch (error) {
          console.error("Failed to parse local user profile context:", error);
        }
      }

      // Default fallback destination for standard authenticated accounts
      router.replace("/profile");
    } else {
      // Push the state change to the next tick of the event loop.
      // This tells the compiler/linter that it is no longer running synchronously
      // within the effect execution pass, avoiding the cascading render warning.
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [router]);

  // Keep the loader up on the server pass, and on the client until we confirm
  // they do not have a token.
  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#0052FF]" />
      </div>
    );
  }

  return <>{children}</>;
}
