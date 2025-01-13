import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profilePhoto: '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {

        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No token found in localStorage');
        }

      try {
        const { data } = await axios.get('http://localhost:8080/api/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Add JWT token for authentication
          },
        });
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    if (profilePhotoFile) {
      formData.append('profilePhoto', profilePhotoFile);
    }

    try 
    {
      const { data } = await axios.post('http://localhost:8080/api/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setUserData(data);
      toast.success("Profile updated successfully",{autoClose:2000});
    //   alert('Profile updated successfully!');
    } 
    catch (error) 
    {
      console.error('Error updating profile:', error);
    //   alert('Failed to update profile.');
      toast.danger("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <div className="w-1/2">
        <h1 className="text-center mb-6">Profile Page</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-left mb-2">Name:</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-left mb-2">Email:</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-left mb-2">Update Profile Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhotoFile(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        <button className='bg-black text-white mt-3 px-4 py-2 rounded'>
        <Link to="/users">Back</Link>
        </button>
      </div>
      <div className="w-1/4 text-center ml-10">
        <h2 className="mb-4">Current Profile Photo</h2>
        {userData.profilePhoto ? (
          <img
            src={`http://localhost:8080/${userData.profilePhoto}`}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto border border-gray-300"
          />
        ) : (
          <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 border border-gray-300 flex items-center justify-center">
            No Photo
          </div>
        )}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Profile;
