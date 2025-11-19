// pages/LoginPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../service/authservice";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // prevent double clicks

    setLoading(true);
    setErrorMessage("");

    const result = await loginUser(email, password);

    setLoading(false);

    if (result.success) {
      navigate("/home");
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      {/* Full-screen overlay spinner */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#0F8A69]">
          SIGN IN
        </h1>

        <form
          onSubmit={handleLogin}
          className="flex flex-col space-y-4 gap-[10px]"
        >
          <p className="text-sm text-center text-gray-500 mt-4">
            Enter your credentials to continue
          </p>

          {errorMessage && (
            <p className="text-red-500 text-sm font-medium text-center">
              {errorMessage}
            </p>
          )}

          <div>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button with loading state */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg transition duration-200 
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0F8A69] hover:bg-[#0D7A5B] text-white"}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-4 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#0F8A69] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
