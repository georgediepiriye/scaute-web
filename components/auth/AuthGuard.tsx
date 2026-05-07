"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
          { method: "GET", credentials: "include" },
        );

        if (!response.ok) {
          // Not logged in? Kick them to login
          router.replace("/auth/signin");
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Auth Guard Error:", error);
        router.replace("/auth/signin");
      }
    };

    checkSession();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-12 h-12">
            {/* Background Ring */}
            <div className="absolute inset-0 border-4 border-gray-100 rounded-2xl" />
            {/* Animated Spinner */}
            <div
              className="absolute inset-0 border-4 border-t-transparent rounded-2xl animate-spin"
              style={{ borderTopColor: KIVO_BLUE }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 animate-pulse">
              Securing Kivo Session
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
              Verifying Credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
