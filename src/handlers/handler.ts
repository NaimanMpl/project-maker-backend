import { Socket } from "socket.io";

export abstract class MessageHandler {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  abstract handleMessage(message: string): void;
}
