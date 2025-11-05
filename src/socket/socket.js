// socket.ts
import { io, Socket } from "socket.io-client";
 
const URL = "https://api.fiveebusiness.com";
 
export const createSocket = (token) => {
  const socket = io(URL, {
    transports: ["websocket"], // ensure WebSocket protocol
    auth: { token: `Bearer ${token}` },
    autoConnect: false, // manually connect when ready
  });
 
  return socket;
};