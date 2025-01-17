import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:8080/api/auth/admin/create-user",
        {
          name,
          email,
          password,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) 
      {
        // alert("User created successfully!");
        // Reset the form
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
        toast.success("User Created Succesfully...");
        setTimeout(() => {
          navigate("/admin"); // Redirect back to the admin panel after user creation
        }, 1000);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Error creating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <h1 className="text-xl">Create New User</h1>
      </div>

      <div className="flex justify-center items-center p-8">
        <div className="bg-white shadow-md rounded-lg p-8 w-96">
          <form className="flex flex-col" onSubmit={handleCreateUser}>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
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
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="host">Host</option>
              <option value="guest">Guest</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateUser;
