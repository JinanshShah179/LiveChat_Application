import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const fetchUsersAndGroups = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user"));
      const { name } = user;

      setName(name);
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const usersResponse = await axios.get("http://localhost:8080/api/user/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const loggedInUserId = JSON.parse(atob(token.split(".")[1])).userId;
      const filteredUsers = usersResponse.data.filter(
        (user) => user._id !== loggedInUserId
      );
      setUsers(filteredUsers);

      const groupsResponse = await axios.get("http://localhost:8080/api/group/userGroups", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroups(groupsResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logout...");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  // Handle profile navigation
  const goToProfile = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    fetchUsersAndGroups();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="flex justify-between items-center p-6 bg-black text-white shadow-md">
        <h1 className="text-xl font-semibold">Chat App</h1>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Account
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
              <ul className="text-black">
                <li
                  onClick={goToProfile}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Profile
                </li>
                <li
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome {name}</h2>

        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold">Your Groups</h3>
          <Link
            to="/group-create"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Create Group
          </Link>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {groups.length > 0 ? (
          <ul className="space-y-3">
            {groups.map((group) => (
              <li
                key={group._id}
                onClick={() => navigate(`/group-chat/${group._id}`)}
                className="p-4 bg-white rounded-lg shadow hover:bg-gray-200 cursor-pointer transition-all duration-200"
              >
                {group.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">You are not a member of any group yet.</p>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-center mb-4">All Users</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => navigate(`/chat/${user._id}`)}
                className="p-4 bg-white rounded-lg shadow hover:bg-gray-200 cursor-pointer transition-all duration-200"
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Users;
