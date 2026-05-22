"use client";

import { useAuth } from "@/components/auth/AuthGuard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the session loading is finished and the user is NOT an admin, boot them out
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/profile");
    }
  }, [user, loading, router]);

  // Show a loading state while fetching user details so non-admins don't see a flash of content
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading security clearance...</p>
      </div>
    );
  }

  // If user is validated as admin, render the page contents safely
  return user?.role === "admin" ? <>{children}</> : null;
}
