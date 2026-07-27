import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "@/pages/Index";
import Login from "@/pages/authentication/Login";
import { ToastContainer } from "react-toastify";
import Register from "@/pages/authentication/Register";
import { AuthProvider } from "@/context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
