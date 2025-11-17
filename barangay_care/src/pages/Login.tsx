// pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../service/authservice";
const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await loginUser(email, password);

    if (result.success) {
      navigate("/home"); // or wherever you want
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
          <div>
            {errorMessage && (
              <p className="text-red-500 text-sm font-medium text-center">
                {errorMessage}
              </p>
            )}
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

          <button
            type="submit"
            className="w-full bg-[#0F8A69] hover:bg-[#0D7A5B] text-white py-2 rounded-lg transition duration-200"
          >
            Sign In
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
