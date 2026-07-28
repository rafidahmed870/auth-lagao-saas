import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/nav/Header";
import Footer from "@/components/nav/Footer";

function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary text-white rounded-full mb-6">
            <span className="text-5xl font-dosis">404</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/")} className="cursor-pointer">
              Back to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NotFound;
