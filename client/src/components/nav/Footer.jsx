import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Lock } from "lucide-react";

// Inline brand SVGs since lucide-react deprecated them in recent versions
const Github = (props) => (
  <svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Twitter = (props) => (
  <svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Linkedin = (props) => (
  <svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border text-foreground font-dosis">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/auth-lagao-web.png"
                alt="Auth Lagao"
                className="h-10 object-cover"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Secure your SaaS applications in seconds. We provide robust,
              easy-to-integrate authentication and user management APIs.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://github.com/rafidahmed870"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-secondary/50 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary/50 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary/50 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-primary">
              Product
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faqs"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-primary">
              Resources
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  to="/docs"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/rafidahmed870/auth-lagao-saas.git"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-primary">
              Stay Updated
            </h3>
            <p className="text-muted-foreground text-sm">
              Subscribe to our newsletter for features updates and security
              alerts.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 mt-1"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-secondary/30 border border-border rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary cursor-pointer text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors text-sm font-medium flex items-center gap-1.5"
              >
                <span>Join</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-8 md:my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-primary" />
            <span>
              &copy; {currentYear}{" "}
              <a
                href="https://github.com/rafidahmed870"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                Rafid Ahmed
              </a>
              . All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-and-conditions"
              className="hover:text-primary transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
