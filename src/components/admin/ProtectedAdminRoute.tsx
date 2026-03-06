import React from "react";
import { useAdmin } from "@/lib/admin-service";
import { AdminLogin } from "./AdminLogin";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { session, isLoading } = useAdmin();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-900 to-bg-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!session?.isAuthenticated) {
    return <AdminLogin />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
