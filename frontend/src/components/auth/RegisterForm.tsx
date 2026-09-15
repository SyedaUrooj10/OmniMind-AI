"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// import axios from "axios";

import api from "@/lib/api";

interface RegisterErrorResponse {
  detail?: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: {
              data?: RegisterErrorResponse;
            };
        }
      ).response;

      if (response?.data?.detail) {
        setError(response.data.detail);
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } else {
      setError(
        "Unable to create your account. Please try again."
      );
    }
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl"
    >
      <h1 className="text-3xl font-bold text-white">
        Create Account 🚀
      </h1>

      <p className="mt-2 text-gray-400">
        Join OmniMind AI and start building intelligent
        applications.
      </p>

      <form
        onSubmit={handleRegister}
        className="mt-8 space-y-5"
      >
        {/* Success Message */}

        {success && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Error Message */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Name */}

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Full Name
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
            <User
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Email
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
            <Mail
              size={18}
              className="text-gray-400"
            />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Password */}

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Password
          </label>

          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
            <Lock
              size={18}
              className="text-gray-400"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={8}
              className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-gray-500"
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="text-gray-400 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Password must be at least 8 characters.
          </p>
        </div>

        {/* Register Button */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        {/* Login Link */}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline"
          >
            Sign in
          </a>
        </p>
      </form>
    </motion.div>
  );
}