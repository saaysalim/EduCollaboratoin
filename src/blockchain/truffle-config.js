module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Ensure this matches the Ganache GUI port
      network_id: "5777", // Ensure this matches the Ganache GUI Network ID
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Ensure this matches the version used in your contracts
    },
  },
};
