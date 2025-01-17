import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();

  const initialPermissions = {
    viewChat: { host: false, user: false, guest: false, admin: false },
    textChat: { host: false, user: false, guest: false, admin: false },
    addMember: { host: false, user: false, guest: false, admin: false },
    deleteGroup: { host: false, user: false, guest: false, admin: false },
  };

  const [permissions, setPermissions] = useState(initialPermissions);

  // Handle checkbox changes
  const handleCheckboxChange = (permission, role) => {
    setPermissions((prevState) => ({
      ...prevState,
      [permission]: {
        ...prevState[permission],
        [role]: !prevState[permission][role],
      },
    }));
  };

  // Handle form submission (if you want to save permissions to server)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can make an API call to save the permissions
    console.log("Permissions saved:", permissions);
    alert("Permissions updated successfully!");
  };

  const handleLogout = () => {
    // Clear user-related data and token
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const handleCreateUserPage = () => {
    navigate("/create-user");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <h1 className="text-xl">Admin Panel</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleCreateUserPage} // Navigate to Create User page
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
          >
            Create New User
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-8 w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          Role Permissions
        </h2>
        <form onSubmit={handleSubmit}>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Permission</th>
                <th className="border px-4 py-2 text-left">Host</th>
                <th className="border px-4 py-2 text-left">User</th>
                <th className="border px-4 py-2 text-left">Guest</th>
                <th className="border px-4 py-2 text-left">Admin</th>
              </tr>
            </thead>
            <tbody>
              {/* Permission 1: View a Chat */}
              <tr>
                <td className="border px-4 py-2">View a Chat</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.viewChat.host}
                    onChange={() => handleCheckboxChange("viewChat", "host")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.viewChat.user}
                    onChange={() => handleCheckboxChange("viewChat", "user")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.viewChat.guest}
                    onChange={() => handleCheckboxChange("viewChat", "guest")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.viewChat.admin}
                    onChange={() => handleCheckboxChange("viewChat", "admin")}
                  />
                </td>
              </tr>
              {/* Permission 2: Text a Chat */}
              <tr>
                <td className="border px-4 py-2">Text a Chat</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.textChat.host}
                    onChange={() => handleCheckboxChange("textChat", "host")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.textChat.user}
                    onChange={() => handleCheckboxChange("textChat", "user")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.textChat.guest}
                    onChange={() => handleCheckboxChange("textChat", "guest")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.textChat.admin}
                    onChange={() => handleCheckboxChange("textChat", "admin")}
                  />
                </td>
              </tr>
              {/* Permission 3: Add a New Member */}
              <tr>
                <td className="border px-4 py-2">Add a New Member</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.addMember.host}
                    onChange={() => handleCheckboxChange("addMember", "host")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.addMember.user}
                    onChange={() => handleCheckboxChange("addMember", "user")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.addMember.guest}
                    onChange={() => handleCheckboxChange("addMember", "guest")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.addMember.admin}
                    onChange={() => handleCheckboxChange("addMember", "admin")}
                  />
                </td>
              </tr>
              {/* Permission 4: Delete Group */}
              <tr>
                <td className="border px-4 py-2">Delete Group</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.deleteGroup.host}
                    onChange={() => handleCheckboxChange("deleteGroup", "host")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.deleteGroup.user}
                    onChange={() => handleCheckboxChange("deleteGroup", "user")}
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.deleteGroup.guest}
                    onChange={() =>
                      handleCheckboxChange("deleteGroup", "guest")
                    }
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={permissions.deleteGroup.admin}
                    onChange={() =>
                      handleCheckboxChange("deleteGroup", "admin")
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Save Permissions
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
