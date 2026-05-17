"use client";

import { API } from "@/lib/api";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  Suspense,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const isProd = process.env.NODE_ENV === "production";

// Client-side helper to set cookies so Next.js middleware can read them
const setClientCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${expires.toUTCString()};SameSite=Lax;secure=${isProd}`;
};

// 💡 FIX: Upgraded deletion framework to ensure it dynamically matches production attributes
const deleteClientCookie = (name: string) => {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax${isProd ? ";secure" : ""}`;
};

interface AuthContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  loading: boolean;
  logout: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUser: (userData: any) => void;
}

const AuthUserContext = createContext<AuthContextType | null>(null);

// 1. ISOLATED REDIRECTION ENGINE
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AuthRedirectListener({
  user,
  loading,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  loading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      !loading &&
      user &&
      (pathname === "/auth/signin" || pathname === "/auth/signup")
    ) {
      const callbackUrl = searchParams.get("callbackUrl") || "/profile";
      router.push(callbackUrl);
    }
  }, [user, loading, pathname, searchParams, router]);

  return null;
}

// 2. MAIN PROVIDER COMPONENT
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        // Grab token out of URL if arriving from a Google OAuth redirect frame
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const urlToken = params.get("token");

          if (urlToken) {
            localStorage.setItem("kivo_token", urlToken);
            setClientCookie("kivo_token", urlToken, 7);

            // Clean up the URL string immediately so the raw token string is hidden
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        // Load local fallback user text immediately to avoid layout flickering
        const localUser = localStorage.getItem("user");
        if (localUser) {
          setUser(JSON.parse(localUser));
        }

        let freshUser = null;

        const response = await API.get("/v1/auth/me");
        freshUser = response.data?.data?.user || response.data?.user;

        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));

          const token = localStorage.getItem("kivo_token");
          if (token) setClientCookie("kivo_token", token, 7);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        const status = err.response?.status || err.status;

        // Ignore standard 401s (unauthenticated users visiting public areas)
        if (status !== 401) {
          console.error(
            "Session bootstrap failed due to an unexpected server issue:",
            err,
          );
        }

        // 💡 FIX: Force-clear BOTH potential cookie keys if credentials expire or become missing
        if (status === 401 || !localStorage.getItem("kivo_token")) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("kivo_token");
          deleteClientCookie("kivo_token");
          deleteClientCookie("token");
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
    localStorage.removeItem("kivo_token");

    // 💡 FIX: Evict both cookie definitions entirely to break the middleware redirection loops
    deleteClientCookie("kivo_token");
    deleteClientCookie("token");

    router.push("/auth/signin");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    const token = localStorage.getItem("kivo_token");
    if (token) setClientCookie("kivo_token", token, 7);
  };

  return (
    <AuthUserContext.Provider value={{ user, loading, logout, updateUser }}>
      {/* 3. SAFETY BOUNDARY INJECTION */}
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
