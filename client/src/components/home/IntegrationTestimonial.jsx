import React from "react";
import csLogo from "@/assets/csharp-logo.png";
import cppLogo from "@/assets/cpp-logo.png";
import jsLogo from "@/assets/js-logo.png";
import tsLogo from "@/assets/ts-logo.png";
import reactLogo from "@/assets/react-logo.png";
import vueLogo from "@/assets/vue-logo.png";
import pythonLogo from "@/assets/python-logo.png";
import phpLogo from "@/assets/php-logo.png";
import javaLogo from "@/assets/java-logo.png";

const logos = [
  { src: csLogo, alt: "C#" },
  { src: cppLogo, alt: "C++" },
  { src: jsLogo, alt: "JavaScript" },
  { src: tsLogo, alt: "TypeScript" },
  { src: reactLogo, alt: "React" },
  { src: vueLogo, alt: "Vue" },
  { src: pythonLogo, alt: "Python" },
  { src: phpLogo, alt: "PHP" },
  { src: javaLogo, alt: "Java" },
];

const doubled = [...logos, ...logos];

function IntegrationTestimonial() {
  return (
    <section className="py-20 overflow-hidden border-b border-border">
      <div className="relative">
        {/* Shadow vignette — lighter on mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {doubled.map((logo, i) => (
            <div key={i} className="flex-shrink-0 mx-8 md:mx-12">
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-10 h-10 md:w-16 md:h-16 object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IntegrationTestimonial;
