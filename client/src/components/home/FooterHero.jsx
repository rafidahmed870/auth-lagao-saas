import React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function FooterHero() {
  const navigate = useNavigate();
  return (
    <section id="footerHero" className="relative py-32 overflow-hidden mt-20">
      {/* Background large text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[6rem] sm:text-[18rem] md:text-[22rem] lg:text-[26rem] font-black text-white/[0.03] leading-[0.85] tracking-tight text-center">
          AUTH
          <br />
          LAGAO
        </span>
      </div>

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
          MODERNIZE YOUR <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500">
            AUTHENTICATION.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed">
          Ready to take your software security to the next level?{" "}
          <br className="hidden md:block" />
          Join the industry standard.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/register")}
          className="mt-10 inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-wide hover:bg-white/90 transition-all duration-300 cursor-pointer shadow-lg shadow-white/10"
        >
          GET STARTED NOW
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

export default FooterHero;

