import Footer from "@/components/nav/Footer";
import Header from "@/components/nav/Header";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import HeroSection from "@/components/home/HeroSection";
import IntegrationTestimonial from "@/components/home/IntegrationTestimonial";
import Features from "@/components/home/Features";
import HowItsWork from "@/components/home/HowItsWork";
import Faqs from "@/components/home/Faqs";
import Pricing from "@/components/home/Pricing";
import FooterHero from "@/components/home/FooterHero";

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
      <HeroSection />
      <IntegrationTestimonial />
      <HowItsWork />
      <Features />
      <Pricing />
      <Faqs />
      <FooterHero />
      <Footer />
    </>
  );
}

export default Index;
