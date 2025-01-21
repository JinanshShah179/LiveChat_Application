import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Dialog, DialogActions, DialogContent,DialogContentText,DialogTitle} from "@mui/material";

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
  const [members, setMembers] = useState([]);
  const [viewMemberVisible, setViewMemberVisible] = useState(false);
  const [groupCreatedBy, setGroupCreatedBy] = useState("");
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState("");
  const [permissions, setPermissions] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const openRemoveMemberDialog = (member) => {
    setMemberToRemove(member);
    setRemoveMemberDialogOpen(true);
  };

  const closeRemoveMemberDialog = () => {
    setMemberToRemove(null);
    setRemoveMemberDialogOpen(false);
  };

  useEffect(() => {

    const fetchGroupDataAndPermissions = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const groupResponse = await axios.get(
          `http://localhost:8080/api/group/${selectedGroupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setGroupName(groupResponse.data.group.name);
        setMembers(groupResponse.data.group.members);

        // console.log(groupResponse.data.group.members);

        setGroupCreatedBy(groupResponse.data.group.createdBy._id);

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

      const alreadyMembersIds = members.map((member) => member._id);
      setSelectedUserIds((prevSelected) => [
        ...prevSelected,
        ...alreadyMembersIds,
      ]);

      setAddMemberVisible(true);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users. Please try again.");
    }
  };

  const addNewMember = async () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user to add.");
      return;
    }

    const newMembers = allUsers.filter((user) =>
      selectedUserIds.includes(user._id)
    );
    setMembers((prevMembers) => [...prevMembers, ...newMembers]);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://localhost:8080/api/group/${selectedGroupId}/add-member`,
        { userIds: selectedUserIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Members added successfully");
        setSelectedUserIds([]); // Clear selected users
        setAddMemberVisible(false); // Close modal
      }
    } catch (error) {
      console.error("Error adding new member:", error);
      toast.warning("User is already present in the group");
      setMembers((prevMembers) =>
        prevMembers.filter(
          (member) =>
            !newMembers.some((newMember) => newMember._id === member._id)
        )
      );
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
        toast.success("Group Deleted Succesfully");
        setTimeout(() => {
          navigate("/users");
        }, 2000);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete the group. Please try again.");
    }
  };

  const removeGroupMember = async (memberId) => {
    try {
      const token = localStorage.getItem("authToken");
      axios.post(
        `http://localhost:8080/api/group/${selectedGroupId}/remove-member`,
        { userId: memberId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMembers((prevMembers) =>
        prevMembers.filter((member) => member._id !== memberId)
      );
      toast.success("Member removed successfully");

      // if (response.data.success) {
      //   toast.success("Member removed succesfully");
      //   fetchGroupDataAndPermissions();
      //   setMembers((prevMembers) =>
      //     prevMembers.filter((member) => member._id !== memberId)
      //   );
      // }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove the member");
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputMessage((prevMessage) => prevMessage + emoji);
  };

  const chatContainerStyles =
    messages.length === 0
      ? { minHeight: "400px", height: "auto", width: "100%" }
      : { height: "400px", maxHeight: "400px", overflowY: "auto" };

  // console.log(messages, messages[0]?.fromUserId, messages[messages.length - 1]?.fromUserId)
  // console.log(members[0].name);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{groupName}</h2>
        <button
          onClick={() => setViewMemberVisible(!viewMemberVisible)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          View Members
        </button>
        {permissions.add_member && (
          <button
            onClick={fetchAllUsers}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Add Member
          </button>
        )}
        {permissions.delete_group && (
          <button
            onClick={handleDialogOpen}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete Group
          </button>
        )}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to delete this group?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Once deleted, the group and its data cannot be recovered. Please
              confirm if you want to proceed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={() => { deleteGroup(); handleDialogClose();}} color="error" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div
        className="flex flex-col space-y-4 overflow-y-auto max-h-[400px] p-2 border border-gray-300 rounded-lg scrollbar-hidden"
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
              className={`bg-gray-200 p-3 rounded-lg ${
                (msg.fromUserId._id || msg.fromUserId) === userId
                  ? "bg-blue-500 text-black"
                  : "bg-gray-300 text-black"
              }`}
            >
              <strong className="text-sm">
                {(msg.fromUserId._id || msg.fromUserId) === userId
                  ? msg.fromUserId.name || msg.fromUserName
                  : msg.fromUserId.name || msg.fromUserName}
              </strong>
              <p>{msg.message}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      {permissions.text_chat && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
            className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
          >
            😊
          </button>
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Send
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
            <h3 className="text-lg font-semibold mb-4">Add Members</h3>
            <div className="max-h-60 overflow-y-auto p-2 border border-gray-300 rounded">
              {allUsers.map((user) => (
                <label key={user._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={user._id}
                    checked={selectedUserIds.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds((prev) => [...prev, user._id]);
                      } else {
                        setSelectedUserIds((prev) =>
                          prev.filter((id) => id !== user._id)
                        );
                      }
                    }}
                    disabled={members.some((member) => member._id === user._id)}
                    className="form-checkbox"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
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
                Add Members
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMemberVisible && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Group Members</h3>
            <div className="max-h-60 overflow-y-auto p-2 border border-gray-300 rounded">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 border-b border-gray-200"
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>

                  {member._id === groupCreatedBy && (
                    <p className="text-xs text-green-500 font-semibold">
                      Group Admin
                    </p>
                  )}

                  {userId === groupCreatedBy &&
                    member._id !== groupCreatedBy && (
                      <button onClick={() => openRemoveMemberDialog(member)} className="text-xs bg-red-500 text-white p-2 rounded-lg">
                        Remove
                      </button>
                    )}
                  <Dialog
                    open={removeMemberDialogOpen}
                    onClose={closeRemoveMemberDialog}
                    aria-labelledby="remove-member-dialog-title"
                    aria-describedby="remove-member-dialog-description"
                  >
                    <DialogTitle id="remove-member-dialog-title">
                      {"Confirm Remove Member"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="remove-member-dialog-description">
                        Are you sure you want to remove{" "}
                        <strong>{memberToRemove?.name}</strong> from the group?
                        This action cannot be undone.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={closeRemoveMemberDialog} color="primary">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (memberToRemove) {
                            removeGroupMember(member._id);
                            closeRemoveMemberDialog();
                          }
                        }}
                        color="error"
                        autoFocus
                      >
                        Confirm
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setViewMemberVisible(false)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
              >
                Close
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
