import React from "react";
import { ArrowRight, Play, Check, Shield, Code2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden border-b border-border"
    >
      {/* Background gradient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">
                Open Source Auth For Licensing
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-7xl font-space-grotesk font-bold leading-tight">
              Best Free Auth for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500">
                Developers.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Ship sign-up in minutes, not weeks. The definitive zero-cost
              alternative to legacy systems. Cryptographic HWID locking,
              instantaneous deployment, and a comprehensive reseller management
              infrastructure — free forever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Button
                  onClick={() => navigate("/dashboard/overview")}
                  className="inline-flex items-center gap-2 px-8 py-4 h-12 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 px-8 py-4 h-12 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}

              <Button
                variant="outline"
                className="inline-flex items-center gap-2 px-8 py-4 h-12 cursor-pointer rounded-xl border border-border font-semibold transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Documentation
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Self Hosted Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free tier in our cluster</span>
              </div>
            </div>
          </div>

          {/* Right Content - Code Editor */}
          <div className="relative animate-float">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-500/10">
              {/* Code Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <Code2 className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">
                      HTTP-only
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    app/auth.py
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm leading-7">
                <div className="text-muted-foreground">
                  <span className="text-blue-400">from</span>{" "}
                  <span className="text-green-400">AuthLagao</span>{" "}
                  <span className="text-blue-400">import</span>{" "}
                  <span className="text-blue-300">api</span>
                </div>
                <div className="text-muted-foreground mt-4">
                  <span className="text-gray-500">
                    # initialize your software license check
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <span className="text-blue-400">app</span> ={" "}
                  <span className="text-blue-400">api</span>(
                </div>
                <div className="text-muted-foreground pl-4">
                  name=<span className="text-green-400">"myapp"</span>,
                </div>
                <div className="text-muted-foreground pl-4">
                  ownerid=<span className="text-green-400">"APP_OWNER_ID"</span>
                  ,
                </div>
                <div className="text-muted-foreground pl-4">
                  version=<span className="text-green-400">"1.0"</span>
                </div>
                <div className="text-muted-foreground">)</div>
                <div className="text-muted-foreground mt-4">
                  <span className="text-gray-500">
                    # secure login with HWID binding
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <span className="text-blue-400">if</span>{" "}
                  <span className="text-blue-300">app</span>.
                  <span className="text-yellow-400">login</span>(username,
                  password):
                </div>
                <div className="text-muted-foreground pl-4">
                  <span className="text-yellow-400">print</span>(
                  <span className="text-green-400">"Software Unlocked!"</span>)
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    Session live
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="text-green-400">200 OK</span>
                  <span>·</span>
                  <span>42ms</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-card border border-border shadow-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Instant deploy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
