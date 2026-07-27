import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "Is Auth Lagao fully hosted?",
    answer:
      "Yes. You can use our hosted auth service with zero setup, or self-host the backend if you need full control.",
  },
  {
    question: "How does Auth Lagao compare to KeyAuth?",
    answer:
      "Auth Lagao focuses on open source licensing and modern auth flows, while still delivering a secure, easy-to-integrate experience.",
  },
  {
    question: "Can I manage resellers?",
    answer:
      "Yes. The platform includes reseller management features so you can control reseller access and licensing tiers.",
  },
];

function Faqs() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section id="faqs" className="bg-background border-b border-border py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-400 font-semibold">FAQ</p>
          <h2 className="mt-4 text-5xl font-space-grotesk font-bold tracking-tight text-foreground">
            Frequently Asked Questions.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Get fast answers to the key questions about hosting, authentication, and reseller management.
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl rounded-3xl bg-background/90 shadow-none divide-y divide-border">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question} className="px-6 py-5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-base font-semibold text-foreground">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="pt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Faqs;
