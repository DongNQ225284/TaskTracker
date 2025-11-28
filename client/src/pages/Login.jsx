import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Nếu đã login thì đá về Dashboard
  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleLogin = async () => {
    try {
      // Mở popup Google
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      // Gửi token xuống Backend
      const res = await api.post("/auth/google", { token });

      // Lưu state vào Context
      login(res.data.token, res.data.user);

      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again!");
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      {/* --- LEFT SIDE: Image/Branding --- */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Họa tiết trang trí đơn giản */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>

        <div className="text-center text-white z-10">
          <h1 className="text-5xl font-bold mb-6">Task Tracker</h1>
          <p className="text-xl text-indigo-100 max-w-md mx-auto leading-relaxed">
            Manage your projects, track tasks, and collaborate with your team in
            one place.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="lg:hidden mb-8">
            {/* Logo cho màn hình nhỏ */}
            <h2 className="text-3xl font-bold text-indigo-600">Task Tracker</h2>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
            <p className="mt-2 text-gray-600">
              Please sign in to continue to your dashboard.
            </p>
          </div>

          <div className="pt-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-medium gap-3 hover:bg-gray-50"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </Button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              By clicking continue, you agree to our{" "}
              <a href="#" className="underline hover:text-indigo-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-indigo-600">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
