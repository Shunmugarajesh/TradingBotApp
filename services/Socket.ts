
import { io, Socket } from "socket.io-client"
import { read } from "./storage"

let socket: Socket | null = null

export const getSocket = async (): Promise<Socket> => {
  if (socket) return socket

  const serverUrl = await read("serverUrl")

  if (!serverUrl) {
    throw new Error("Server URL not set")
  }

  socket = io(serverUrl, {
    transports: ["websocket"],
    autoConnect: false
  })

  return socket
}

// export const socket = io("https://tradingview-f4d7.onrender.com/", {
//   transports: ["websocket"],
//   autoConnect: false
// })