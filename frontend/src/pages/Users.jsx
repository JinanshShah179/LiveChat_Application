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
  const navigate = useNavigate();

  // Fetch users for creating new groups and groups user is part of
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

      console.log({groupsResponse})
      
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

  // const addNewGroup = (newGroup) => {
  //   setGroups((prevGroups) => [...prevGroups, newGroup]);
  // };

  useEffect(() => {
    console.log("Useeffect called!")
    fetchUsersAndGroups();
  }, []);

  return (
    <div className="min-h-screen bg-black-100 flex flex-col">
      <header className="flex justify-end items-center p-4 bg-black-600 text-black">
        <button
          onClick={handleLogout}
          className="bg-black hover:bg-black text-white px-4 py-2 m-2 rounded"
        >
          Logout
        </button>
        <button className="bg-black hover:bg-black text-white px-4 py-2 rounded">
          <li className="no-underline">
            <Link to="/profile">Profile</Link>
          </li>
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          <li className="no-underline">
            <Link to="/group-create">Create Group</Link>
          </li>
        </button>
      </header>

      <h1 className="flex mb-4 text-lg pl-10 font-bold">Welcome {name}</h1>

      <div>
        <h2 className="flex justify-center text-lg font-bold text-center">
          Your Groups
        </h2>
        <main className="flex-grow p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {groups.length > 0 ? (
            <ul className="space-y-2">
              {groups.map((group) => (
                <li
                  key={group._id}
                  onClick={() => navigate(`/group-chat/${group._id}`)} // Updated to redirect to group chat
                  className="p-4 bg-white rounded shadow hover:bg-gray-100 cursor-pointer"
                >
                  {group.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not a member of any group yet.</p>
          )}
        </main>
      </div>

      <div>
        <h2 className="flex justify-center text-lg font-bold text-center">
          All Users
        </h2>
        <main className="flex-grow p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => navigate(`/chat/${user._id}`)} // Navigate to individual user chat
                className="p-4 bg-white rounded shadow hover:bg-gray-100 cursor-pointer"
              >
                {user.name}
              </li>
            ))}
          </ul>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Users;
