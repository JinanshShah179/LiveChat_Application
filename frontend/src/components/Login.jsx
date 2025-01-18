import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Logging in with:", email, password);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { token, name, user, userId } = response.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", userId);
        localStorage.setItem("name", name);
        toast.success("Welcome...");
        const { role, permissions } = JSON.parse(localStorage.getItem("user"));
        localStorage.setItem("role", role);
        localStorage.setItem("permissions", permissions);
        // console.log("Role :",role);
        // console.log("Permissions:",permissions);
        if (role === "admin") {
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          setTimeout(() => {
            navigate("/users");
          }, 1000);
        }
      }
      // console.log('Login successful:', response.data);
    } catch (err) {
      console.error("Error during login:", err);
      if (err.response) {
        setError(
          err.response.data.message || "Invalid credentials. Please try again."
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl text-center font-semibold mb-6 text-gray-700">
          Login Page
        </h2>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 hover:underline hover:text-blue-700"
          >
            Sign up
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
