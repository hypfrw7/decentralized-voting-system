module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (Ganache)
      port: 7545, // Ganache default port
      network_id: "5777", // Match Ganache's network ID (set to 1337 to match your Ganache/MetaMask)
    },
  },

  compilers: {
    solc: {
      version: "0.5.15", // Match contract pragma
    },
  },
};
