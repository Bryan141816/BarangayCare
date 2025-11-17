// pages/SignUpPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../service/authservice";
const SignUpPage = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordStrength, setPasswordStrength] = useState(""); // weak/medium/strong
  const [confirmError, setConfirmError] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength("");
      return;
    }

    const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const mediumPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (strongPattern.test(password)) setPasswordStrength("strong");
    else if (mediumPattern.test(password)) setPasswordStrength("medium");
    else setPasswordStrength("weak");
  }, [password]);

  // Check confirm password in real-time
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmError("");
      return;
    }

    setConfirmError(
      password === confirmPassword ? "" : "Passwords do not match",
    );
  }, [confirmPassword, password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(""); // clear old error

    if (confirmError) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const result = await registerUser({
      firstName,
      lastName,
      address,
      age: Number(age),
      gender,
      birthday,
      email,
      password,
    });

    if (result.success) {
      navigate("/login");
    } else {
      setErrorMessage(result.error || "Something went wrong");
    }
  };

  // Helper for password bar color
  const getBarColor = () => {
    if (passwordStrength === "weak") return "bg-red-500 w-1/3";
    if (passwordStrength === "medium") return "bg-yellow-500 w-2/3";
    if (passwordStrength === "strong") return "bg-green-500 w-full";
    return "w-0";
  };
  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-[#0F8A69]">
          SIGN UP
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Fill in your details to create an account
        </p>
        <form onSubmit={handleSignUp} className="flex flex-col gap-[10px]">
          {errorMessage && (
            <p className="text-red-500 text-sm font-medium text-center">
              {errorMessage}
            </p>
          )}

          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            required
          />
          <input
            type="date"
            value={birthday}
            onChange={(e) => {
              setBirthday(e.target.value);
              setAge(calculateAge(e.target.value).toString());
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            disabled
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
            required
          />

          {/* Password Field with strength bar */}

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
              required
            />
            {passwordStrength && (
              <div className="flex items-center mt-1 gap-2">
                {/* Strength text */}
                <span
                  className={`font-bold text-sm ${
                    passwordStrength === "weak"
                      ? "text-red-500"
                      : passwordStrength === "medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {passwordStrength.toUpperCase()}
                </span>
                {/* Strength bar */}
                <div className="flex-1 h-1 bg-gray-200 rounded">
                  <div className={`${getBarColor()} h-1 rounded`}></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8A69]"
              required
            />
            {confirmError && (
              <span className="font-bold text-sm text-red-500">
                {confirmError}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F8A69] hover:bg-[#0D7A5B] text-white py-2 rounded-lg transition duration-200"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0F8A69] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
