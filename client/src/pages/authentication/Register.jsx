import React, { useState } from "react";
import Header from "@/components/nav/Header";
import Footer from "@/components/nav/Footer";
import { toast } from "react-toastify";
import googleLogo from "@/assets/google-logo.png";
import discordLogo from "@/assets/discord-logo.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function Register() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterBtn = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill all the fields");
      return;
    }
    setLoading(true);

    try {
      const response = await register(name, email, password);
      if (response.success) {
        toast.success(response.message);
        navigate("/login");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || "Registration Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="my-20 flex items-center justify-center px-4">
        <div className="w-full sm:w-[420px] md:w-[450px] rounded-md border border-border p-6 sm:p-8">
          <h2 className="text-2xl text-white sm:text-3xl font-space-grotesk font-medium text-center mb-6">
            Register
          </h2>

          <div className="flex flex-col items-center justify-between space-y-3 font-dosis">
            <Button
              variant="outline"
              className="h-10 cursor-pointer hover:bg-gray-100"
              type="button"
            >
              <img
                src={googleLogo}
                alt="Google Logo"
                className="mr-2 h-5 w-5"
              />
              Register with Google
            </Button>

            <Button
              variant="outline"
              className="h-10 cursor-pointer hover:bg-gray-100"
              type="button"
            >
              <img
                src={discordLogo}
                alt="Discord Logo"
                className="mr-2 h-5 w-5"
              />
              Register with Discord
            </Button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground font-dosis">
              Or sign up with credentials
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full bg-secondary/30 border border-border rounded-md py-2 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-secondary/30 border border-border rounded-md py-2 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-secondary/30 border border-border rounded-md py-2 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full h-10 mt-4 cursor-pointer hover:bg-primary/80 font-dosis"
              disabled={loading}
              onClick={handleRegisterBtn}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground font-dosis">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium font-dosis text-primary hover:underline"
            >
              Login
            </Link>{" "}
            Now
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
