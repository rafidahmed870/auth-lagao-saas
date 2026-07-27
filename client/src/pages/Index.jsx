import Footer from "@/components/nav/Footer";
import Header from "@/components/nav/Header";
import React from "react";

function Index() {
  return (
    <>
      <Header />
      <div className="mt-16">
        <h1 className="text-3xl font-bold">Hello, World!</h1>
      </div>
      <Footer />
    </>
  );
}

export default Index;
