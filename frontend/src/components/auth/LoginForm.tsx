
"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

import api from "@/lib/api";
import { setToken } from "@/lib/auth";

interface ValidationError {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
  input?: unknown;
}

interface LoginErrorResponse {
  detail?: string | ValidationError[];
}

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        },
      );

      const accessToken =
        response.data?.access_token;

      if (!accessToken) {
        throw new Error(
          "No access token received from server.",
        );
      }

      setToken(accessToken);

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      const axiosError =
        error as AxiosError<LoginErrorResponse>;

      const detail =
        axiosError.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (
        Array.isArray(detail) &&
        detail.length > 0
      ) {
        const firstError = detail[0];

        setError(
          firstError?.msg ||
            "Please check the information you entered.",
        );
      } else if (
        error instanceof Error &&
        error.message
      ) {
        setError(error.message);
      } else {
        setError(
          "Unable to login. Please check your email and password.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
      }}
      className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl"
    >
      <h1 className="text-3xl font-bold text-white">
        Welcome Back 👋
      </h1>

      <p className="mt-2 text-gray-400">
        Sign in to continue using OmniMind AI
      </p>

      <form
        onSubmit={handleLogin}
        className="mt-8 space-y-6"
      >
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Email
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-blue-400/50">
            <Mail
              size={18}
              className="shrink-0 text-gray-400"
            />

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Password
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-blue-400/50">
            <Lock
              size={18}
              className="shrink-0 text-gray-400"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              autoComplete="current-password"
              className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="text-gray-400 transition hover:text-white"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="accent-cyan-500"
            />

            Remember me
          </label>

          <a
            href="/forgot-password"
            className="text-sm text-cyan-400 transition hover:text-cyan-300 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        {/* SIGN IN BUTTON */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={
            loading
              ? {}
              : {
                  scale: 1.02,
                }
          }
          whileTap={
            loading
              ? {}
              : {
                  scale: 0.98,
                }
          }
          className="flex h-14 w-full items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-400 hover:to-violet-500 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </motion.button>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Do not have an account?{" "}

          <a
            href="/register"
            className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline"
          >
            Create an account
          </a>
        </p>
      </form>
    </motion.div>
  );
}






