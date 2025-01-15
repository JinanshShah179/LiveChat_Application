import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const socket = io("http://localhost:8080");

const emojis = [
  "😀",
  "😁",
  "😂",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😋",
  "😎",
  "😍",
  "😘",
  "😗",
  "😙",
  "😚",
  "😜",
  "😝",
  "😛",
  "🤑",
  "🤗",
  "🤔",
  "🤨",
  "😐",
  "😑",
  "😶",
  "🙄",
  "😏",
  "😬",
  "😪",
  "😴",
  "😷",
  "🤒",
  "🤕",
  "🤢",
  "🤮",
  "🤧",
  "🥺",
  "😵",
  "🤯",
  "🤠",
  "😇",
  "🥳",
  "😈",
  "👿",
  "👹",
  "👺",
  "🤖",
  "💀",
  "☠️",
  "👻",
  "💩",
  "🤡",
  "👽",
  "👾",
  "🎃",
  "😺",
  "😸",
  "😹",
  "😻",
  "😼",
  "😽",
  "🙀",
  "😿",
  "😾",
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
];

const GroupChat = () => {
  const { groupId: selectedGroupId } = useParams();
  // const userId = localStorage.getItem("userId");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { name, userId } = user;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [groupName, setGroupName] = useState("Loading...");
  const [groupCreatedBy, setGroupCreatedBy] = useState("");
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const groupResponse = await axios.get(
          `http://localhost:8080/api/group/${selectedGroupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGroupName(groupResponse.data.group.name);
        setGroupCreatedBy(groupResponse.data.group.createdBy._id);

        const response = await axios.get(
          `http://localhost:8080/api/group/${selectedGroupId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching group messages:", error);
        if (error.response?.status === 401) {
          alert("Authentication failed. Please log in again.");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
      }
    };

    if (selectedGroupId) {
      fetchGroupMessages();
      socket.emit("join-group", selectedGroupId); // Join the group room
    }

    return () => {
      socket.emit("leave-group", selectedGroupId); // Leave the group room on cleanup
    };
  }, [selectedGroupId]);

  useEffect(() => {
    socket.on("receive-group-message", (newMessage) => {
      if (newMessage.groupId === selectedGroupId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => socket.off("receive-group-message");
  }, [selectedGroupId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // console.log(name);

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:8080/api/group/send",
        {
          fromUserId: userId,
          groupId: selectedGroupId,
          message: inputMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("send-group-message", {
        fromUserId: userId,
        fromUserName: name,
        groupId: selectedGroupId,
        message: inputMessage,
        createdAt: new Date().toISOString(),
      });
      console.log("Send Group message",userId,selectedGroupId,inputMessage,name);
      setInputMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchAllUsers = async ()=>{
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8080/api/user/users",{
        headers:{Authorization:`Bearer ${token}`},
      });
      const filteredUsers = response.data.filter((user) => user._id !== userId);
      setAllUsers(filteredUsers);
      console.log(filteredUsers);
      setAddMemberVisible(true);
    } catch (error) {
      console.error("Error fetching users:",error);
      alert("Failed to fetch users.Please try again.");
    }
  } 

  const handleEmojiClick = (emoji) => {
    setInputMessage((prevMessage) => prevMessage + emoji);
  };

  const deleteGroup = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `http://localhost:8080/api/group/${selectedGroupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        navigate("/users");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete the group. Please try again.");
    }
  };

  const addNewMember = async () => {
    
    if (!selectedUserId) 
    {
      alert("Please select a user to add.");
      return;
    }

    try 
    {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://localhost:8080/api/group/${selectedGroupId}/add-member`,
        { userId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) 
      {
        // alert("Member added successfully!");
        toast.success("Member added successfully");
        setSelectedUserId(""); // Clear selected user
        setAddMemberVisible(false); // Close modal
      }
    } catch (error) 
    {
      console.error("Error adding new member:", error);
      toast.warning("User is already present in the group");
      // alert("Select a differnet userid user is already present in the group");
    }
  };

  const chatContainerStyles =
    messages.length === 0
      ? { minHeight: "400px", height: "auto", width: "100%" }
      : { height: "400px", maxHeight: "400px", overflowY: "auto" };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{groupName}</h2>
        {userId === groupCreatedBy && (
          <div className="flex space-x-2">
            <button
              onClick={fetchAllUsers}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Add Member
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this group?")
                ) {
                  deleteGroup();
                }
              }}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete Group
            </button>
          </div>
        )}
      </div>

      <div
        className="flex flex-col space-y-4 overflow-y-auto max-h-[400px] p-2 border border-gray-300 rounded-lg"
        style={chatContainerStyles}
      >
        {messages.map((msg) => (
          <div
            key={`${msg.fromUserId._id || msg.fromUserId}_${msg.createdAt}`}
            className={`flex items-start space-x-2 ${
              (msg.fromUserId._id || msg.fromUserId) === userId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`bg-blue-500 p-3 rounded-lg ${
                msg.fromUserId._id === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              <strong className="text-sm">
                {msg.fromUserId._id === userId ? "" : msg.fromUserId.name}
              </strong>
              <p className="text-white">{msg.message}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center space-x-2 relative"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
        >
          😀
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>

      {emojiPickerVisible && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-72 grid grid-cols-8 gap-2 bg-white p-2 rounded-lg shadow-lg z-50">
          <div className="col-span-full text-right">
            <button
              onClick={() => setEmojiPickerVisible(false)}
              className="text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Close
            </button>
          </div>
          {emojis.map((emoji, index) => (
            <div
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl cursor-pointer hover:bg-gray-200 rounded-lg p-2"
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {addMemberVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Member</h3>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="" disabled>
                Select a user
              </option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={addNewMember}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add
              </button>
              <button
                onClick={() => setAddMemberVisible(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="bg-black text-white mt-3 px-4 py-2 rounded">
        <Link to="/users">Back</Link>
      </button>
      <ToastContainer/>
    </div>
  );
};

export default GroupChat;
