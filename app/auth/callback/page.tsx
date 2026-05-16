"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("kivo_token", token);
      router.push("/profile");
    } else {
      router.push("/auth/signin");
    }
  }, [searchParams, router]);

  return <div>Authenticating with Kivo account...</div>;
}
