import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useParams, Link } from "react-router-dom";

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
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const messageEndRef = useRef(null);
  const [typingStatus, setTypingStatus] = useState(null);
  const [receiverData, setreceiverData] = useState(null);
  const [senderData, setSenderData] = useState(null);

  useEffect(() => {
    if (!recipientId) {
      console.error("Recipient ID is undefined");
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:8080/api/chat/messages",
          {
            params: { toUserId: recipientId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // console.log("reponse data",response.data.messages);
        // console.log("reponse date",response.data.messages.createdAt).toLocaleDateString();
        // console.log("Sender data",response.data.sender);
        // console.log("Reciever data", response.data.receiver);
        setMessages(response.data.messages);
        setSenderData(response.data.sender);
        setreceiverData(response.data.receiver);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

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
        console.log("Typing = ", userId);

        setTypingStatus("Typing...");
      }
    });

    socket.on("stopTyping", ({ userId }) => {
      if (userId !== loggedInUserId) {
        console.log("Stop Typing = ", userId);
        setTypingStatus(null);
      }
    });

    return () => {
      socket.off("newMessage", handleNewMessage); // Cleanup event listener
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [recipientId, loggedInUserId]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when messages change
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:8080/api/chat/send",
        {
          fromUserId: loggedInUserId,
          toUserId: recipientId,
          message: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("sendMessage", {
        fromUserId: loggedInUserId,
        toUserId: recipientId,
        message: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleTyping = () => {
    console.log("Handle typing called");
    socket.emit("typing", { chatId: recipientId, userId: loggedInUserId });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: recipientId,
        userId: loggedInUserId,
      });
    }, 1000); // Stop typing after 2 seconds
  };

  let typingTimeout;

  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji);
  };

  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent page refresh
    sendMessage();
    socket.emit("stopTyping", { chatId: recipientId, userId: loggedInUserId });
  };

  const chatContainerStyles = messages.length === 0
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

      <div className="flex flex-col space-y-4 overflow-y-auto max-h-[400px] p-2 border border-gray-300 rounded-lg scrollbar-hidden" style={chatContainerStyles}>
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
              className={`max-w-[70%] p-3 rounded-lg text- ${
                msg.fromUserId === loggedInUserId
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-500 text-white self-start"
              }`}
            >
              <strong className="text-white">
                {msg.fromUserId === loggedInUserId
                  ? senderData?.name
                  : receiverData?.name}{" "}
              </strong>
              <p className="mt-1">{msg.message}</p>
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
export default Chat;
