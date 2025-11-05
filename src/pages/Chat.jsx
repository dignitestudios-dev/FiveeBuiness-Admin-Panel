import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ✅ Connect socket
  useEffect(() => {
    const s = io("https://api.fiveebusiness.com", {
      auth: {
        token: localStorage.getItem("authToken"), // must be admin JWT
      },
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Connected as admin:", s.id);
      s.emit("get_online_users");
    });

    s.on("online_users", (users) => {
      console.log("👥 Online users:", users);
      setOnlineUsers(users);
    });

    s.on("chat_history", (history) => {
      setMessages(history);
    });

    s.on("receive_message", (msg) => {
      if (
        msg.senderId === selectedUser ||
        msg.receiverId === selectedUser
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    s.on("update_chat_list", () => {
      s.emit("get_online_users");
    });

    return () => {
      s.disconnect();
    };
  }, [selectedUser]);

  // ✅ When selecting a user
  const selectUser = (userId) => {
    setSelectedUser(userId);
    setMessages([]);
    socket.emit("get_chat_history", { userId, adminId: "admin" });
  };

  // ✅ Send message
  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;
    socket.emit("send_message", {
      receiverId: selectedUser,
      message: input,
    });
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-300 bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Online Users</h2>
        {onlineUsers.length === 0 ? (
          <p className="text-gray-500">No users online</p>
        ) : (
          onlineUsers.map((u) => (
            <div
              key={u}
              onClick={() => selectUser(u)}
              className={`cursor-pointer p-2 mb-2 rounded ${
                selectedUser === u
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              User #{u}
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 p-4">
        {selectedUser ? (
          <>
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h2 className="text-xl font-semibold">
                Chat with User #{selectedUser}
              </h2>
              <span className="text-gray-500 text-sm">
                {messages.length} messages
              </span>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded shadow-sm p-4 mb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 flex ${
                    msg.senderRole === "admin"
                      ? "justify-end text-right"
                      : "justify-start text-left"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-[70%] ${
                      msg.senderRole === "admin"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex">
              <input
                type="text"
                className="flex-1 border rounded-l p-2 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 rounded-r"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
