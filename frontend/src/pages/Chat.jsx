import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DownloadIcon from "@mui/icons-material/Download";

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

const Chat = () => {
  const { recipientId } = useParams();
  const loggedInUserId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const messageEndRef = useRef(null);
  const [typingStatus, setTypingStatus] = useState(null);
  const [receiverData, setReceiverData] = useState(null);
  const [senderData, setSenderData] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const fetchMessagesAndPermissions = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Fetch messages
        const messagesResponse = await axios.get(
          "http://localhost:8080/api/chat/messages",
          {
            params: { toUserId: recipientId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(messagesResponse.data.messages);
        setSenderData(messagesResponse.data.sender);
        setReceiverData(messagesResponse.data.receiver);

        // Fetch permissions
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

        setHasPermission(updatedPermissions.text_chat);
      } catch (err) {
        console.error("Error fetching messages or permissions:", err);
      }
    };

    fetchMessagesAndPermissions();

    socket.emit("joinRoom", loggedInUserId);

    const handleNewMessage = (message) => {
      if (
        message.fromUserId === recipientId ||
        message.toUserId === recipientId
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", ({ userId }) => {
      if (userId !== loggedInUserId) {
        setTypingStatus("Typing...");
      }
    });

    socket.on("stopTyping", ({ userId }) => {
      if (userId !== loggedInUserId) {
        setTypingStatus(null);
      }
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [recipientId, loggedInUserId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("fromUserId", loggedInUserId);
      formData.append("toUserId", recipientId);
      formData.append("message", newMessage);

      const response = await axios.post(
        "http://localhost:8080/api/chat/send",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("sendMessage", {
        fromUserId: loggedInUserId,
        toUserId: recipientId,
        message: newMessage,
        file: response.data.data.file,
      });

      setNewMessage("");
      setFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { chatId: recipientId, userId: loggedInUserId });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: recipientId,
        userId: loggedInUserId,
      });
    }, 1000);
  };

  let typingTimeout;

  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage();
    socket.emit("stopTyping", { chatId: recipientId, userId: loggedInUserId });
  };

  const chatContainerStyles =
    messages.length === 0
      ? { minHeight: "400px", height: "auto", width: "100%" }
      : { height: "400px", maxHeight: "400px", overflowY: "auto" };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center space-x-3">
        {receiverData?.profilePhoto ? (
          <img
            src={`http://localhost:8080/${receiverData?.profilePhoto.replace(
              "\\",
              "/"
            )}`}
            alt={receiverData?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-lg font-semibold">
            {receiverData?.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <h2 className="text-xl font-semibold text-left">
          {receiverData?.name}
        </h2>
      </div>

      <div
        className="flex flex-col space-y-4 overflow-y-auto max-h-[400px] p-2 border border-gray-300 rounded-lg scrollbar-hidden"
        style={chatContainerStyles}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.fromUserId === loggedInUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg text-white ${
                msg.fromUserId === loggedInUserId
                  ? "bg-blue-500 self-end"
                  : "bg-gray-500 self-start"
              }`}
            >
              <strong className="text-white">
                {msg.fromUserId === loggedInUserId
                  ? senderData?.name
                  : receiverData?.name}
              </strong>
              <p className="mt-1">{msg.message}</p>

              {msg.file && (
                <div className="mt-2">
                  {msg.file.endsWith(".pdf") ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        {msg.file.split("/").pop()}
                      </span>
                      <a
                        href={`http://localhost:8080/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                        title="View PDF"
                      >
                        <RemoveRedEyeIcon className="text-white" />
                      </a>
                      <a
                        href={`http://localhost:8080/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-blue-500 hover:text-blue-700"
                        title="Download PDF"
                      >
                        <DownloadIcon className="text-white" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <img
                        src={`http://localhost:8080/${msg.file}`}
                        alt="Attached file"
                        className="max-w-[200px] mt-2 rounded-lg"
                      />
                      <a
                        href={`http://localhost:8080/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-black hover:text-blue-700"
                        title="Download File"
                      >
                        <DownloadIcon className="text-white" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <span className="text-xs text-gray-300 block justify-end mb-1 text-end">
                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {typingStatus && (
          <div className="text-gray-500 mt-2 pr-2 text-sm">{typingStatus}</div>
        )}
        <div ref={messageEndRef} />
      </div>

      {hasPermission && (
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2 relative"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer flex items-center justify-center p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
            title="Attach file"
          >
            📎
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*,application/pdf,.docx,.xslx"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden px-4 py-2 h-2"
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </form>
      )}

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
            <button
              key={index}
              className="text-2xl"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {file && (
        <div className="mt-2 flex items-center space-x-2">
          {file.type === "application/pdf" ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{file.name}</span>
              <a
                href={URL.createObjectURL(file)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
                title="View PDF"
              >
                <RemoveRedEyeIcon />
              </a>
              <button
                onClick={() => setFile(null)} // Remove the file
                className="text-red-500 hover:text-red-700"
                title="Remove Attachment"
              >
                🗑️
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <img
                src={URL.createObjectURL(file)}
                alt="Attached file"
                className="max-w-[200px] mt-2 rounded-lg"
              />
              <button
                onClick={() => setFile(null)} // Remove the file
                className="text-red-500 hover:text-red-700"
                title="Remove Attachment"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Chat;
