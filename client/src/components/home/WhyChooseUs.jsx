import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Users, Globe, Activity } from "lucide-react";
import { bangladeshMapData } from "@/components/ui/bangladesh-map";

// Division coordinate mappings to place dots and lines accurately
const DIVISION_CENTERS = {
  "BD-C": {
    name: "Dhaka",
    lng: 90.41,
    lat: 23.81,
    label: "Core Hub",
    latency: "2ms",
    status: "Optimal",
  },
  "BD-B": {
    name: "Chittagong",
    lng: 91.78,
    lat: 22.33,
    label: "Edge Node",
    latency: "12ms",
    status: "Active",
  },
  "BD-G": {
    name: "Sylhet",
    lng: 91.87,
    lat: 24.89,
    label: "Edge Node",
    latency: "18ms",
    status: "Active",
  },
  "BD-E": {
    name: "Rajshahi",
    lng: 88.6,
    lat: 24.37,
    label: "Edge Node",
    latency: "14ms",
    status: "Active",
  },
  "BD-D": {
    name: "Khulna",
    lng: 89.54,
    lat: 22.82,
    label: "Edge Node",
    latency: "15ms",
    status: "Active",
  },
  "BD-A": {
    name: "Barisal",
    lng: 90.36,
    lat: 22.7,
    label: "Edge Node",
    latency: "16ms",
    status: "Active",
  },
  "BD-F": {
    name: "Rangpur",
    lng: 89.25,
    lat: 25.75,
    label: "Edge Node",
    latency: "19ms",
    status: "Active",
  },
  "BD-H": {
    name: "Mymensingh",
    lng: 90.4,
    lat: 24.75,
    label: "Edge Node",
    latency: "11ms",
    status: "Active",
  },
};

// SVG Projection functions
const projectLng = (lng) => {
  const minLng = 87.8;
  const maxLng = 92.9;
  return ((lng - minLng) / (maxLng - minLng)) * 500;
};

const projectLat = (lat) => {
  const minLat = 20.3;
  const maxLat = 26.9;
  return (1 - (lat - minLat) / (maxLat - minLat)) * 600;
};

const featurePoints = [
  {
    icon: <Zap className="w-5 h-5 text-blue-400" />,
    title: "Bangladeshi Local Infrastructure (BDIX Fast)",
    desc: "Our servers are hosted on local BDIX and Bangladeshi cloud infrastructure. Users from any part of Bangladesh experience a response time of less than 15 milliseconds!",
    highlight: "Latency: ~2ms to ~19ms",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    title: "Military-Grade Security & Local Protection",
    desc: "Cryptographic HWID locking and local IP rate-limiting features that will keep your software 100% secure against DDoS and cyberattacks.",
    highlight: "Cryptographic HWID Locked",
  },
  {
    icon: <Users className="w-5 h-5 text-purple-400" />,
    title: "Bengali Documentation & Direct bKash/Nagad Payments",
    desc: "No need for dollar cards, subscribe in local currency (BDT), and get dedicated 24/7 Bengali support from local engineers for any integration issues.",
    highlight: "bKash / Nagad / Rocket Active",
  },
];

function WhyChooseUs() {
  const [hoveredDivision, setHoveredDivision] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState("BD-C");

  // Dhaka Core Hub coordinates
  const dhakaCenter = DIVISION_CENTERS["BD-C"];
  const dhakaX = projectLng(dhakaCenter.lng);
  const dhakaY = projectLat(dhakaCenter.lat);

  return (
    <section
      id="why-choose-us"
      className="py-24 relative overflow-hidden border-b border-border bg-background"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Made for Bangladesh
          </div>
          <h2 className="text-4xl lg:text-5xl font-space-grotesk font-bold">
            Why Choose Us?
          </h2>
          <p className="text-muted-foreground text-base">
            A super-fast and secure authentication service designed specifically
            for Bangladeshi developers and software providers.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Feature points stacked vertically */}
          <div className="lg:col-span-6 space-y-10">
            {featurePoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="flex gap-4 items-start"
              >
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10">
                  {point.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold font-space-grotesk text-foreground">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {point.desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400/80">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>{point.highlight}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Bangladesh Map */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[5/6] w-full max-w-[480px] mx-auto lg:ml-auto">
              <svg
                viewBox="0 0 500 600"
                className="w-full h-full select-none"
                style={{
                  filter: "drop-shadow(0px 10px 30px rgba(59, 130, 246, 0.15))",
                }}
              >
                {/* Outer Map Glow Backing */}
                <g opacity="0.15" filter="blur(8px)">
                  {bangladeshMapData.features.map((feature, i) => {
                    const divId = feature.properties.id;
                    const isHovered = hoveredDivision === divId;
                    const isSelected = selectedDivision === divId;
                    if (feature.geometry.type === "Polygon") {
                      const pointsString = feature.geometry.coordinates[0]
                        .map(
                          ([lng, lat]) =>
                            `${projectLng(lng)},${projectLat(lat)}`,
                        )
                        .join(" ");
                      return (
                        <polygon
                          key={`glow-${i}`}
                          points={pointsString}
                          fill={isHovered || isSelected ? "#3b82f6" : "#1e293b"}
                        />
                      );
                    }
                    return null;
                  })}
                </g>

                {/* Interactive SVG Division Polygons */}
                <g>
                  {bangladeshMapData.features.map((feature, i) => {
                    const divId = feature.properties.id;
                    const isHovered = hoveredDivision === divId;
                    const isSelected = selectedDivision === divId;

                    if (feature.geometry.type === "Polygon") {
                      const pointsString = feature.geometry.coordinates[0]
                        .map(
                          ([lng, lat]) =>
                            `${projectLng(lng)},${projectLat(lat)}`,
                        )
                        .join(" ");
                      return (
                        <polygon
                          key={`poly-${i}`}
                          points={pointsString}
                          className="transition-all duration-300 cursor-pointer"
                          style={{
                            fill: isSelected
                              ? "rgba(59, 130, 246, 0.2)"
                              : isHovered
                                ? "rgba(59, 130, 246, 0.12)"
                                : "rgba(30, 41, 59, 0.4)",
                            stroke: isSelected
                              ? "rgba(59, 130, 246, 0.85)"
                              : isHovered
                                ? "rgba(59, 130, 246, 0.6)"
                                : "rgba(255, 255, 255, 0.12)",
                            strokeWidth: isSelected || isHovered ? 1.5 : 1,
                          }}
                          onMouseEnter={() => setHoveredDivision(divId)}
                          onMouseLeave={() => setHoveredDivision(null)}
                          onClick={() => setSelectedDivision(divId)}
                        />
                      );
                    }
                    return null;
                  })}
                </g>

                {/* Pulsing connection lines back to Dhaka Core Hub */}
                <g pointerEvents="none">
                  {Object.entries(DIVISION_CENTERS).map(([key, node]) => {
                    if (key === "BD-C") return null;
                    const fromX = projectLng(node.lng);
                    const fromY = projectLat(node.lat);

                    const midX =
                      (fromX + dhakaX) / 2 + (fromY > dhakaY ? 25 : -25);
                    const midY = (fromY + dhakaY) / 2 - 25;

                    const isSelected =
                      selectedDivision === key || selectedDivision === "BD-C";

                    return (
                      <g key={`link-${key}`}>
                        <path
                          d={`M ${fromX} ${fromY} Q ${midX} ${midY} ${dhakaX} ${dhakaY}`}
                          fill="none"
                          stroke={
                            isSelected
                              ? "rgba(59, 130, 246, 0.4)"
                              : "rgba(255, 255, 255, 0.05)"
                          }
                          strokeWidth={isSelected ? 2 : 1}
                          className="transition-all duration-300"
                        />
                        <path
                          d={`M ${fromX} ${fromY} Q ${midX} ${midY} ${dhakaX} ${dhakaY}`}
                          fill="none"
                          stroke={
                            isSelected ? "#60a5fa" : "rgba(255, 255, 255, 0.15)"
                          }
                          strokeWidth={isSelected ? 1.5 : 1}
                          strokeDasharray="4 6"
                          className="transition-all duration-300"
                          style={{
                            animation: "dash 15s linear infinite",
                            strokeDashoffset: 100,
                          }}
                        />
                      </g>
                    );
                  })}
                </g>

                {/* Network Nodes (Dots) */}
                <g>
                  {Object.entries(DIVISION_CENTERS).map(([key, node]) => {
                    const cx = projectLng(node.lng);
                    const cy = projectLat(node.lat);
                    const isDhaka = key === "BD-C";
                    const isSelected = selectedDivision === key;
                    const isHovered = hoveredDivision === key;

                    return (
                      <g
                        key={`node-${key}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDivision(key)}
                        onMouseLeave={() => setHoveredDivision(null)}
                        onClick={() => setSelectedDivision(key)}
                      >
                        {isDhaka && (
                          <>
                            <circle
                              cx={cx}
                              cy={cy}
                              r="18"
                              fill="rgba(16, 185, 129, 0.15)"
                              className="animate-ping"
                              style={{ animationDuration: "3s" }}
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r="10"
                              fill="rgba(16, 185, 129, 0.3)"
                            />
                          </>
                        )}
                        {(isSelected || isHovered) && !isDhaka && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="12"
                            fill="rgba(59, 130, 246, 0.3)"
                            className="animate-pulse"
                          />
                        )}

                        <circle
                          cx={cx}
                          cy={cy}
                          r={isDhaka ? 6 : 4.5}
                          fill={
                            isDhaka
                              ? "#10b981"
                              : isSelected || isHovered
                                ? "#60a5fa"
                                : "#ffffff"
                          }
                          stroke={isDhaka ? "#ffffff" : "rgba(0, 0, 0, 0.6)"}
                          strokeWidth={1.5}
                          className="transition-all duration-300"
                        />

                        <circle
                          cx={cx}
                          cy={cy}
                          r={isDhaka ? 2.5 : 1.5}
                          fill="#ffffff"
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>

              <style>{`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -1000;
                  }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;

