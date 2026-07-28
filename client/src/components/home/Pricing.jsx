import React from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "৳0",
    period: "/ forever",
    description: "Everything you need to test the waters.",
    features: [
      "1 Application",
      "10 Users per App",
      "Hardware ID Locking",
      "All Auth Methods",
      "Community support",
    ],
    cta: "Start Free",
    href: "/register",
    popular: false,
  },
  {
    name: "Developer",
    price: "৳50",
    oldPrice: "৳100",
    period: "/ per month",
    description: "For growing software that needs more headroom.",
    features: [
      "Unlimited Applications",
      "10,000+ Users Per App",
      "Team Management",
      "Function Management",
      "Priority email support",
    ],
    cta: "Buy Now",
    href: "/buy/developer",
    popular: true,
  },
  {
    name: "Seller",
    price: "৳100",
    oldPrice: "৳200",
    period: "/ per month",
    description: "Scale with unlimited users and team features.",
    features: [
      "All In Developer +",
      "Audit & Webhooks",
      "Discord Bot",
      "Telegram Bot",
      "Seller API",
    ],
    cta: "Buy Now",
    href: "/buy/seller",
    popular: false,
  },
];

function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-28 overflow-hidden border-b border-border"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space-grotesk font-bold leading-tight max-w-2xl mx-auto mb-6">
            Perfect plans for your needs.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-blue-500/40 bg-card/80 shadow-lg shadow-blue-500/10 scale-[1.03]"
                  : "border-border bg-card/50"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Most popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-bold text-foreground mb-1">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {plan.oldPrice}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25"
                    : "border border-border bg-background/50 text-foreground hover:bg-accent"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
