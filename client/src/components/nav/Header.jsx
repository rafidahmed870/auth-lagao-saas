import { ArrowRight, Menu } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const navigate = useNavigate();

  const handleLogoutBtn = async () => {
    const response = await logout();
    if (response.success) {
      toast.success(response.message);
      navigate("/login");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className=" bg-background/80 backdrop-blur-md border border-border">
        <div className="max-w-7xl mx-auto flex items-center px-4">
          {/* Logo */}
          <div className="p-2">
            <a href="/#hero">
              <img
                src="/auth-lagao-web.png"
                className="w-full h-12 object-cover"
              />
            </a>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center gap-8 font-dosis font-light">
              <a
                href="/#hero"
                className="relative text-gray-100 hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Home
              </a>
              <a
                href="/#features"
                className="relative text-gray-100 hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Features
              </a>

              <a
                href="/#pricing"
                className="relative text-gray-100 hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Pricing
              </a>

              <Link
                to="/docs"
                className="relative text-gray-100 hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Docs
              </Link>

              <a
                href="https://github.com/rafidahmed870"
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-gray-100 hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                GitHub
              </a>

              <a
                href="#faqs"
                className="relative text-gray-100 hover:text-primary transition-colors duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Faqs
              </a>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-6">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium hover:text-primary hidden md:block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 hidden md:block"
                >
                  <span className="flex flex-row items-center">
                    Register <ArrowRight className="ml-2 w-3 h-3" />
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Button
                  disabled={loading}
                  onClick={() => navigate("/dashboard/overview")}
                  className="hidden md:block cursor-pointer font-dosis"
                >
                  Dashboard
                </Button>
                <Button
                  disabled={loading}
                  onClick={handleLogoutBtn}
                  variant="outline"
                  className="hidden md:block cursor-pointer font-dosis"
                >
                  Logout
                </Button>
              </>
            )}

            {/* Mobile Hamburger Menu with Sheet */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className="p-2 text-gray-100 hover:text-primary transition-colors focus:outline-none">
                  <Menu className="w-6 h-6" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] bg-background border-l border-border p-6 flex flex-col gap-6 text-gray-100"
                >
                  <SheetHeader className="p-0 flex flex-row items-center justify-between">
                    <SheetTitle className="text-xl font-dosis font-bold text-primary">
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-3 font-dosis mt-4">
                    <a
                      href="#hero"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                    >
                      Home
                    </a>
                    <div className="h-px bg-border/40" />
                    <a
                      href="#features"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                    >
                      Features
                    </a>
                    <div className="h-px bg-border/40" />
                    <a
                      href="#pricing"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                    >
                      Pricing
                    </a>
                    <div className="h-px bg-border/40" />
                    <Link
                      to="/docs"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                    >
                      Docs
                    </Link>
                    <div className="h-px bg-border/40" />
                    <a
                      href="https://github.com/rafidahmed870"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                    >
                      GitHub
                    </a>
                    <div className="h-px bg-border/40" />
                    <a
                      href="#faqs"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                    >
                      Faqs
                    </a>
                    <div className="h-px bg-border/40" />
                    {!user ? (
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="text-lg text-center font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                      >
                        Login
                      </Link>
                    ) : (
                      <Button
                        onClick={() => navigate("/dashboard/overview")}
                        className="text-lg text-center font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                      >
                        Dashboard
                      </Button>
                    )}
                    <div className="h-px bg-border/40" />
                    {!user ? (
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 text-center"
                      >
                        Register
                      </Link>
                    ) : (
                      <Button
                        disabled={loading}
                        onClick={handleLogoutBtn}
                        variant="outline"
                        className="text-lg text-center font-medium text-gray-200 hover:text-primary transition-colors pb-1"
                      >
                        Logout
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

