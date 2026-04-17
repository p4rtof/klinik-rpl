import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/storage";
import type { Session } from "@/types/klinik";
import { requireAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "DOKTER";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const session: Session | null = getSession();

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (requiredRole && session.role !== requiredRole) {
      router.push("/login");
    }
  }, [session, requiredRole, router]);

  if (!session || (requiredRole && session.role !== requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
