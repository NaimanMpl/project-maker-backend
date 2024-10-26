import { Socket as ServerSocket } from "socket.io";

export const waitForServer = async (socket: ServerSocket, channel: string) => {
  return new Promise((resolve) => {
    socket.on(channel, resolve);
  });
};
