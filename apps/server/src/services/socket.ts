import { Server } from "socket.io";
import Redis from "ioredis";

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT as unknown as number,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT as unknown as number,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("socketService constructor");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListener() {
    const io = this.io;
    io.on("connect", (socket) => {
      console.log(`Socket ${socket.id} connected.`);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("new message received: ", message);
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });
    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
