import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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
  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("user");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [groupName, setGroupName] = useState("Loading...");
  const messageEndRef = useRef(null);


  useEffect(() => {
    const fetchGroupMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const groupResponse = await axios.get(
          `http://localhost:8080/api/group/${selectedGroupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(groupResponse.data.group.name);
        setGroupName(groupResponse.data.group.name);

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

  // Listen for incoming group messages via Socket.IO
  useEffect(() => {
    socket.on("receive-group-message", (newMessage) => {
      console.log(newMessage);
      if (newMessage.groupId === selectedGroupId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    console.log(messages);
    return () => socket.off("receive-group-message");
  }, [selectedGroupId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message to the group
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
        groupId: selectedGroupId,
        message: inputMessage,
      });

      setInputMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputMessage((prevMessage) => prevMessage + emoji);
  };

  console.log({userId,messages})

  const chatContainerStyles = messages.length === 0
  ? { minHeight: "400px", height: "auto", width: "100%" }
  : { height: "400px", maxHeight: "400px", overflowY: "auto" };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">{groupName}</h2>

      <div className="flex flex-col space-y-4 overflow-y-auto max-h-[400px] p-2 border border-gray-300 rounded-lg" style={chatContainerStyles}>
        {messages.map((msg) => (
          <div
            key={`${msg.fromUserId}_${msg.createdAt}`}
            className={`flex items-start space-x-2 ${
              (msg.fromUserId._id || msg.fromUserId ) === userId ? "justify-end" : "justify-start"
            }`}
          >
           
            <div
              className={`bg-gray-200 p-3 rounded-lg ${
                msg.fromUserId === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              <strong className="text-sm">
               {msg.fromUserId === userId ? "" : (msg.fromUserId.name || name)}
              </strong>
              <p>{msg.message}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
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

      <button className="bg-black text-white mt-3 px-4 py-2 rounded">
        <Link to="/users">Back</Link>
      </button>
    </div>
  );
};

export default GroupChat;
