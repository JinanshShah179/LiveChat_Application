import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [permissions, setPermissions] = useState({});
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupDataAndPermissions = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Fetch group messages and details
        const groupResponse = await axios.get(
          `http://localhost:8080/api/group/${selectedGroupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGroupName(groupResponse.data.group.name);
        setGroupCreatedBy(groupResponse.data.group.createdBy._id);
        // console.log(groupCreatedBy);

        const messagesResponse = await axios.get(
          `http://localhost:8080/api/group/${selectedGroupId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(messagesResponse.data.messages);

        // Fetch updated permissions
        const userData = JSON.parse(localStorage.getItem("user"));
        const role = userData?.role;

        const permissionsResponse = await axios.post(
          "http://localhost:8080/api/permission/permissions",
          { role },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedPermissions = permissionsResponse.data.permission;
        userData.permissions = updatedPermissions;
        localStorage.setItem("user", JSON.stringify(userData));
        setPermissions(updatedPermissions);
      } catch (error) {
        console.error("Error fetching group data or permissions:", error);
        if (error.response?.status === 401) {
          alert("Authentication failed. Please log in again.");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
      }
    };

    if (selectedGroupId) {
      fetchGroupDataAndPermissions();
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
      setInputMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8080/api/user/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredUsers = response.data.filter((user) => user._id !== userId);
      setAllUsers(filteredUsers);
      setAddMemberVisible(true);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users. Please try again.");
    }
  };

  const addNewMember = async () => {
    if (!selectedUserId) {
      alert("Please select a user to add.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://localhost:8080/api/group/${selectedGroupId}/add-member`,
        { userId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Member added successfully");
        setSelectedUserId(""); // Clear selected user
        setAddMemberVisible(false); // Close modal
      }
    } catch (error) {
      console.error("Error adding new member:", error);
      toast.warning("User is already present in the group");
    }
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

  const handleEmojiClick = (emoji) => {
    setInputMessage((prevMessage) => prevMessage + emoji);
  };

  const chatContainerStyles =
    messages.length === 0
      ? { minHeight: "400px", height: "auto", width: "100%" }
      : { height: "400px", maxHeight: "400px", overflowY: "auto" };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{groupName}</h2>
        {permissions.add_member  && (
          <button
            onClick={fetchAllUsers}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Add Member
          </button>
        )}
        {permissions.delete_group  && (
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
        )}
      </div>

      <div
        className="flex flex-col space-y-4 overflow-y-auto max-h-[400px] p-2 border border-gray-300 rounded-lg scrollbar-hidden"
        style={chatContainerStyles}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.fromUserId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                msg.fromUserId === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>
      {permissions.text_chat &&(
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
        <button
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
        >
          😊
        </button>
      </div>
  )}

      {emojiPickerVisible && permissions.text_chat && (
        <div className="grid grid-cols-8 gap-1 p-2 bg-gray-100 rounded-md max-w-xs">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:bg-gray-200 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {addMemberVisible && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add a Member</h3>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select a User</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setAddMemberVisible(false)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addNewMember}
                className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default GroupChat;
