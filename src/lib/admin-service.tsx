import React, { useState, useEffect, createContext, useContext } from "react";

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || "admin",
  password: import.meta.env.VITE_ADMIN_PASSWORD || "admin123",
  email: import.meta.env.VITE_ADMIN_EMAIL || "admin@neongrid.com",
};

const ADMIN_SESSION_KEY = "neon_grid_admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  loginTime: Date;
  expiresAt: Date;
}

export const adminService = {
  // Authenticate admin with hardcoded credentials
  authenticate(
    username: string,
    password: string,
  ): Promise<AdminSession | null> {
    return new Promise((resolve) => {
      console.log("🔐 Admin authentication attempt:", {
        username,
        expectedUsername: ADMIN_CREDENTIALS.username,
        passwordLength: password.length,
        expectedPasswordLength: ADMIN_CREDENTIALS.password.length,
      });

      // Simulate API call delay
      setTimeout(() => {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          console.log("✅ Admin authentication successful");
        } else {
          console.log("❌ Admin authentication failed - credentials mismatch");
        }

        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          const now = new Date();
          const session: AdminSession = {
            isAuthenticated: true,
            username: ADMIN_CREDENTIALS.username,
            loginTime: now,
            expiresAt: new Date(now.getTime() + SESSION_DURATION),
          };

          // Save session to localStorage
          localStorage.setItem(
            ADMIN_SESSION_KEY,
            JSON.stringify({
              ...session,
              loginTime: session.loginTime.toISOString(),
              expiresAt: session.expiresAt.toISOString(),
            }),
          );

          console.log("💾 Admin session saved to localStorage");
          resolve(session);
        } else {
          resolve(null);
        }
      }, 1000);
    });
  },

  // Get current admin session
  getCurrentSession(): AdminSession | null {
    try {
      console.log("🔍 Checking for existing admin session...");
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!storedSession) {
        console.log("❌ No stored session found");
        return null;
      }

      console.log("📄 Found stored session, parsing...");
      const session = JSON.parse(storedSession);
      const expiresAt = new Date(session.expiresAt);

      // Check if session is expired
      if (expiresAt < new Date()) {
        console.log("⏰ Session expired, logging out");
        this.logout();
        return null;
      }

      console.log("✅ Valid session found:", {
        username: session.username,
        expiresAt: expiresAt.toISOString(),
      });
      return {
        isAuthenticated: session.isAuthenticated,
        username: session.username,
        loginTime: new Date(session.loginTime),
        expiresAt: expiresAt,
      };
    } catch (error) {
      console.error("Error parsing admin session:", error);
      return null;
    }
  },

  // Logout admin
  logout(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // Check if admin is authenticated
  isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    return session?.isAuthenticated === true;
  },
};

// Admin context
interface AdminContextType {
  session: AdminSession | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const existingSession = adminService.getCurrentSession();
    setSession(existingSession);
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newSession = await adminService.authenticate(username, password);
      if (newSession) {
        setSession(newSession);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    adminService.logout();
    setSession(null);
  };

  return (
    <AdminContext.Provider value={{ session, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
