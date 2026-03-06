import { Navigation } from "@/components/layout/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UsernameDialog } from "@/components/UsernameDialog";
import { AdminProvider } from "@/lib/admin-service";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { useEffect } from "react";
import { db } from "./lib/firebase";
import Index from "./pages/Index";
import RoomPage from "./pages/RoomPage";
import WireframeRoom from "./pages/WireframeRoom";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    console.log("🚀 NeonGrid app initialized successfully");

    // Import and expose Firebase Storage test function
    import("./lib/firebase-storage").then((firebaseStorage) => {
      (window as any).testFirebaseStorage =
        firebaseStorage.testFirebaseStorageConfig;
      console.log(
        "🔥 Firebase Storage test function available: window.testFirebaseStorage()",
      );
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UsernameDialog />
          <BrowserRouter>
            <div className="min-h-screen grid-bg">
              <Navigation />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/rooms/:roomId" element={<RoomPage />} />
                  <Route path="/wireframe/:id" element={<WireframeRoom />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
};

export default App;
