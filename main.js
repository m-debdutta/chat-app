const net = require("node:net");
const { ChatServer } = require("./src/chat-server");
const { IOController } = require("./src/io-controller");

const main = () => {
  const server = net.createServer();
  server.listen(8000);

  const ioController = new IOController();
  const chatServer = new ChatServer(server, ioController);
  chatServer.start();
};

main();
