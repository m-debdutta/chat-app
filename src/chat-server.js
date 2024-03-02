const { User } = require("./user");

class ChatServer {
  #server;
  #users;
  #ioController;

  constructor(server, ioController) {
    this.#server = server;
    this.#users = {};
    this.#ioController = ioController;
  }

  #add(user, userName) {
    this.#users[userName] = user;
  }

  #has(userName) {
    return userName in this.#users;
  }

  #logAndSendMessage(senderName, text, receiverName) {
    const message = `${senderName} : ${text}` + "\n";

    const sender = this.#users[senderName];
    const receiver = this.#users[receiverName];

    if (!receiver) {
      const response = {
        acknowledgement: "unregistered-receiver",
        info: "Receiver doesn't exists.\n",
      };
      this.#ioController.write(senderName, response);
      return;
    }

    sender.addMessage(message);
    receiver.addMessage(message);

    this.#ioController.write(receiverName, {
      acknowledgement: "new-message",
      info: message,
    });
  }

  #renderChatHistory(userName) {
    const messages = this.#users[userName].messages.join("");
    this.#ioController.write(userName, {
      acknowledgement: "chat-history",
      info: messages,
    });
  }

  #sendMessage(senderName, text) {
    const request = JSON.parse(text);
    const { currentReceiver, data } = request.info;
    this.#logAndSendMessage(senderName, data, currentReceiver);
  }

  #login(userName) {
    const user = this.#users[userName];

    user.toggleOnlineStatus();
    this.#renderChatHistory(userName);
  }

  #signUp(userName) {
    const user = new User(userName);
    this.#add(user, userName);
  }

  #authenticateUser(userName) {
    const isExistingUser = this.#has(userName);

    if (isExistingUser) {
      this.#login(userName);
      return;
    }
    this.#signUp(userName);
  }

  #greetUser(userName) {
    const greetingMessage = `Hello ${userName} !!\n`;
    const response = { acknowledgement: "greeting", info: greetingMessage };
    this.#ioController.write(userName, response);
  }

  #acknowledgeInvalidUser(socket) {
    socket.write(
      JSON.stringify({
        acknowledgement: "invalid-user",
        info: "User by this name already exists.\n",
      })
    );
    socket.end();
  }

  #registerUser(socket, userName) {
    this.#ioController.addConnection(socket, userName);
    this.#greetUser(userName);
    this.#authenticateUser(userName);
  }

  start() {
    this.#server.on("connection", (socket) => {
      socket.setEncoding("utf-8");
      const message = "Enter your name: ";
      socket.write(
        JSON.stringify({ acknowledgement: "registration", info: message })
      );

      socket.once("data", (data) => {
        const { info } = JSON.parse(data);
        const userName = info.data;
        const isExistingUser = this.#has(userName);

        if (isExistingUser && this.#users[userName].isOnline) {
          this.#acknowledgeInvalidUser(socket);
          return;
        }

        this.#registerUser(socket, userName);

        socket.on("data", (data) => this.#sendMessage(userName, data));
        socket.on("close", () => this.#users[userName].toggleOnlineStatus());
      });
    });
  }
}

module.exports = { ChatServer };
