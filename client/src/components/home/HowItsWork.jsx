import React from "react";
import { Network, Cable, Rocket } from "lucide-react";

const steps = [
  {
    icon: Network,
    title: "Create an application",
    description: "Spin up an app in the dashboard and grab your app ID.",
  },
  {
    icon: Cable,
    title: "Drop in the SDK",
    description: "Download the C/C++, Python SDK and initialize it.",
  },
  {
    icon: Rocket,
    title: "Lock down your software",
    description: "Generate keys, bind HWIDs, and protect your desktop apps.",
  },
];

function HowItsWork() {
  return (
    <section
      id="howItsWork"
      className="relative py-28 overflow-hidden border-b border-border"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px]" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-700/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            How It's Work
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-space-grotesk font-bold leading-tight max-w-3xl mx-auto">
            Three steps. No weeks-
            <br className="hidden sm:block" />
            long licensing project.
          </h2>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon with background to mask the line */}
              <div className="w-14 h-14 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center mb-6 relative z-10">
                <step.icon className="w-6 h-6 text-blue-400" />
              </div>

              {/* Step label */}
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Step {i + 1}
              </p>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}

          {/* Connecting line — behind icons, centered on their vertical position */}
          <div
            className="hidden md:block absolute h-px bg-border z-0"
            style={{ top: "28px", left: "16.67%", right: "16.67%" }}
          />
        </div>
      </div>
    </section>
  );
}

export default HowItsWork;
