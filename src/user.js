class User {
  #userName;
  #onlineStatus;
  #messages;

  constructor(userName) {
    this.#userName = userName;
    this.#onlineStatus = true;
    this.#messages = [];
  }

  get userName() {
    return this.#userName;
  }

  get isOnline() {
    return this.#onlineStatus;
  }

  get messages() {
    return [...this.#messages];
  }

  toggleOnlineStatus() {
    this.#onlineStatus = !this.#onlineStatus;
  }

  addMessage(message) {
    this.#messages.push(message);
  }
}

module.exports = { User };
