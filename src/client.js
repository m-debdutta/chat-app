const net = require("node:net");

const generateRequest = (requestType, requestInfo) => {
  return {
    requestType,
    info: requestInfo,
  };
};

const initiateClient = (client, stdin, stdout) => {
  stdin.setEncoding("utf-8");

  client.on("connect", () => {
    client.setEncoding("utf-8");
    stdout.write("connected to chat server\n");
    let currentReceiver;

    client.on("data", (data) => {
      const response = JSON.parse(data);
      stdout.write(response.info);
    });

    stdin.on("data", (text) => {
      const data = text.trim();

      if (data.startsWith("connect:")) {
        const [receiver] = data.split(":").slice(-1);
        currentReceiver = receiver;
        return;
      }

      const request = generateRequest("send-message", {
        currentReceiver,
        data,
      });

      client.write(JSON.stringify(request));
    });
  });

  client.on("end", () => {
    stdin.destroy();
  });
};

const createClient = () => {
  const port = parseInt(process.argv[2]);
  const client = net.createConnection(port);
  initiateClient(client, process.stdin, process.stdout);
};

createClient();
