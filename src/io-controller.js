class IOController {
  #connections;

  constructor() {
    this.#connections = {};
  }

  addConnection(socket, userName) {
    this.#connections[userName] = socket;
  }

  write(receiver, message) {
    this.#connections[receiver].write(JSON.stringify(message));
  }
}

module.exports = { IOController };
