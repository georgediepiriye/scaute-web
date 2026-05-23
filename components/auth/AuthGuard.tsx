/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  Suspense,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { API } from "@/lib/api";

const isProd = process.env.NODE_ENV === "production";

const setClientCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;expires=${expires.toUTCString()};SameSite=Lax${isProd ? ";secure" : ""}`;
};

const deleteClientCookie = (name: string) => {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax${isProd ? ";secure" : ""}`;
};

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => void;
  updateUser: (userData: any, bypassRedirect?: boolean) => void;
}

const AuthUserContext = createContext<AuthContextType | null>(null);

function AuthRedirectListener({
  user,
  loading,
}: {
  user: any;
  loading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isOnboardingActive =
      localStorage.getItem("skaute_onboarding_lock") === "true";
    if (isOnboardingActive) return;

    if (!loading && user) {
      if (pathname === "/auth/signin" || pathname === "/auth/signup") {
        if (user.role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          const callbackUrl = searchParams.get("redirect") || "/profile";
          router.replace(callbackUrl);
        }
      }
    }
  }, [user, loading, pathname, searchParams, router]);

  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const localUser = localStorage.getItem("user");
      try {
        return localUser ? JSON.parse(localUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const urlToken = params.get("token");

          if (urlToken) {
            localStorage.setItem("skaute_token", urlToken);
            setClientCookie("skaute_token", urlToken, 7);
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        const response = await API.get("/v1/auth/me");
        const freshUser = response.data?.data?.user || response.data?.user;

        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
          setClientCookie("user_role", freshUser.role, 7);

          const token = localStorage.getItem("skaute_token");
          if (token) setClientCookie("skaute_token", token, 7);
        }
      } catch (err: any) {
        const status = err.response?.status || err.status;
        if (status === 401 || !localStorage.getItem("skaute_token")) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("skaute_token");
          localStorage.removeItem("skaute_onboarding_lock");
          deleteClientCookie("skaute_token");
          deleteClientCookie("user_role");
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, [pathname]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("skaute_token");
    localStorage.removeItem("skaute_onboarding_lock");
    deleteClientCookie("skaute_token");
    deleteClientCookie("user_role");
    router.push("/auth/signin");
  };

  const updateUser = (userData: any, bypassRedirect = false) => {
    if (bypassRedirect) {
      localStorage.setItem("skaute_onboarding_lock", "true");
    }
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setClientCookie("user_role", userData.role, 7);
    const token = localStorage.getItem("skaute_token");
    if (token) setClientCookie("skaute_token", token, 7);
  };

  return (
    <AuthUserContext.Provider value={{ user, loading, logout, updateUser }}>
      <Suspense fallback={null}>
        <AuthRedirectListener user={user} loading={loading} />
      </Suspense>
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error(
      "useAuth must be wrapped cleanly inside an AuthProvider component wrapper.",
    );
  }
  return context;
};
