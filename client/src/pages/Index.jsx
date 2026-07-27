import Footer from "@/components/nav/Footer";
import Header from "@/components/nav/Header";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";

function Index() {
  // User Authentication Check
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutBtn = async () => {
    const response = logout();
    if (response.success) {
      toast.success(response.message);
      navigate("/login");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <>
      <Header />
      <div className="mt-16">
        <h1 className="text-3xl font-bold">
          Hello, {user ? user.name : "Guest"}!
        </h1>
        {/* Logout Btn */}
        <button
          onClick={handleLogoutBtn}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Logout
        </button>
      </div>
      <Footer />
    </>
  );
}

export default Index;
