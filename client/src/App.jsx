import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "@/pages/Index";
import Login from "@/pages/authentication/Login";
import { ToastContainer } from "react-toastify";
import Register from "@/pages/authentication/Register";
import { AuthProvider } from "@/context/AuthContext";
import Overview from "@/pages/dashboard/overview/Overview";
import NotFound from "@/pages/NotFound";
import Licenses from "@/pages/dashboard/licenses/Licenses";
import Users from "@/pages/dashboard/users/Users";
import Subscription from "@/pages/dashboard/subscriptions/Subscription";
import Team from "@/pages/dashboard/team/Team";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* /dashboard → redirect to overview */}
              <Route
                path="/dashboard"
                element={<Navigate to="/dashboard/overview" replace />}
              />

              {/* PROTECTED ROUTES */}
              <Route
                path="/dashboard/overview"
                element={
                  <ProtectedRoute>
                    <Overview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/licenses"
                element={
                  <ProtectedRoute>
                    <Licenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/team"
                element={
                  <ProtectedRoute>
                    <Team />
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={true}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
              icon={false}
              closeButton={false}
              toastClassName="custom-toast"
            />
          </TooltipProvider>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

