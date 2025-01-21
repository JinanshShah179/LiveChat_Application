import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GroupCreate = () => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('User is not authenticated.');
        }

        const response = await axios.get('http://localhost:8080/api/user/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const loggedInUserId = JSON.parse(atob(token.split('.')[1])).userId;
        const filteredUsers = response.data.filter(user => user._id !== loggedInUserId);
        setUsers(filteredUsers);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, []);

  // Handle group name change
  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  // Handle user selection
  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId)); // Deselect user
    } else {
      setSelectedUsers([...selectedUsers, userId]); // Select user
    }
  };

  // Handle form submission for creating a group
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName || selectedUsers.length === 0) {
      setError('Please provide a group name and select at least one member.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('user'));

      await axios.post(
        'http://localhost:8080/api/group/create',
        {
          name:groupName,
          members: selectedUsers,
          createdBy: userData.userId, // Set the logged-in user as the group creator
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log(response);
      navigate('/users')
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create the group.');
    }
  };

  return (
    <div className="min-h-screen bg-black-100 flex flex-col">
      <header className="flex justify-end items-center p-4 bg-black-600 text-black">
        <button
          onClick={() => navigate('/users')}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Back to Users
        </button>
      </header>
      <h1 className="text-2xl font-bold text-center mt-8">Create Group</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center mt-8">
        <div className="mb-4">
          <label htmlFor="groupName" className="text-white">Group Name:</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={handleGroupNameChange}
            className="p-3 border border-gray-300 rounded-lg"
            placeholder="Enter group name"
            required
          />
        </div>
        
        <div className="mb-4">
          <h3 className="text-black">Select Members:</h3>
          <ul className="space-y-2">
            {users.map(user => (
              <li key={user._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={user._id}
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelect(user._id)}
                  className="mr-2"
                />
                <label htmlFor={user._id} className="text-black">{user.name}</label>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          Create Group
        </button>
      </form>
    </div>
  );
};

export default GroupCreate;
